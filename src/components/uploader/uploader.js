import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { uniq } from 'lodash-es';
import { createAttachment, setUploadError } from '../../redux/action-creators';
import { useServerValue } from '../hooks/server-info';
import { useBool } from '../hooks/bool';
import { getDraft, setDraftField, subscribeToDrafts } from '../../services/drafts';

// SPA-unique upload identifier
let nextId = 1;

export function useUploader({
  // Upload success (takes attachment object and upload ID)
  onSuccess = null,
  fileIds: givenFileIds = [],
  maxCount = Infinity,
  draftKey,
} = {}) {
  const dispatch = useDispatch();
  const store = useStore();
  const statuses = useSelector((state) => state.attachmentUploadStatuses);
  const allUploads = useSelector((state) => state.attachmentUploads);

  // Immutables
  const [unfinishedFiles, uploadIds] = useMemo(() => [new Map(), new Set()], []);

  const [, forceUpdate] = useBool();

  // Attachments management
  const [initialFileIds, setInitialFileIds] = useState(
    () => getDraft(draftKey)?.fileIds ?? givenFileIds,
  );
  const [fileIds, setFileIds] = useState(() => initialFileIds);
  const updatedLocally = useRef(false);
  const setFileIdsLocally = useCallback((arg) => {
    setFileIds(arg);
    updatedLocally.current = true;
  }, []);

  const removeFile = useCallback(
    (idToRemove) => setFileIdsLocally((ids) => ids.filter((id) => id !== idToRemove)),
    [setFileIdsLocally],
  );
  const reorderFiles = useCallback(
    (reorderedIds) => setFileIdsLocally((oldIds) => uniq(reorderedIds.concat(oldIds))),
    [setFileIdsLocally],
  );

  useEffect(() => {
    if (!draftKey) {
      return;
    }
    return subscribeToDrafts(() => {
      const fileIds = getDraft(draftKey)?.fileIds ?? initialFileIds;
      setInitialFileIds(fileIds);
      setFileIds(fileIds);
    });
  }, [draftKey, initialFileIds]);

  useEffect(() => {
    if (!draftKey || !updatedLocally.current) {
      return;
    }
    updatedLocally.current = false;
    const st = store.getState();
    setDraftField(
      draftKey,
      'files',
      fileIds.map((id) => st.attachments[id]),
    );
  }, [draftKey, fileIds, store]);

  const isUploading = useMemo(
    () => [...uploadIds].some((id) => statuses[id]?.loading),
    [statuses, uploadIds],
  );

  const maxFileSize = useServerValue(selectFileSizeLimit, Infinity);

  const doUploadFile = useCallback(
    (file) => {
      if (fileIds.length + unfinishedFiles.size >= maxCount) {
        // No more files accepting
        return;
      }

      const uplId = `upl${nextId++}`;
      uploadIds.add(uplId);

      const sizeError = checkFileSize(file, maxFileSize);
      if (sizeError) {
        dispatch(setUploadError(uplId, file.name, sizeError));
        return;
      }

      unfinishedFiles.set(uplId, file);
      dispatch(createAttachment(uplId, file));
    },
    [dispatch, fileIds.length, maxCount, maxFileSize, unfinishedFiles, uploadIds],
  );

  // The 'uploadFile' function can be called synchronously multiple times
  const filesQueue = useRef([]);
  const uploadFile = useCallback(
    (file) => {
      filesQueue.current.push(file);
      if (filesQueue.current.length === 1) {
        forceUpdate();
      }
    },
    [forceUpdate],
  );

  // Process queue by one file on every render
  useEffect(() => {
    const file = filesQueue.current.shift();
    file && doUploadFile(file);
  });

  useEffect(() => {
    // All successful uploads in the right order
    const allFileIds = [
      ...initialFileIds,
      ...[...uploadIds]
        .filter((id) => statuses[id]?.success)
        .map((id) => allUploads[id]?.attachment.id)
        .filter(Boolean),
    ];

    // Detect successful uploads
    for (const id of uploadIds) {
      if (statuses[id]?.success && unfinishedFiles.has(id)) {
        unfinishedFiles.delete(id);
        setFileIdsLocally((ids) => {
          const newFileIds = new Set([...ids, allUploads[id].attachment.id]);
          // Return updated ids in same order as allFileIds
          return allFileIds.filter((id) => newFileIds.has(id));
        });
        onSuccess?.(allUploads[id].attachment, id);
      }
    }
  }, [
    allUploads,
    initialFileIds,
    onSuccess,
    setFileIdsLocally,
    statuses,
    unfinishedFiles,
    uploadIds,
  ]);

  const uploadProgressProps = useMemo(
    () => ({ uploadIds, statuses, unfinishedFiles }),
    [statuses, unfinishedFiles, uploadIds],
  );

  const postAttachmentsProps = useMemo(
    () => ({
      attachmentIds: fileIds,
      removeAttachment: removeFile,
      reorderImageAttachments: reorderFiles,
      isEditing: true,
    }),
    [fileIds, removeFile, reorderFiles],
  );

  const clearUploads = useCallback(() => {
    uploadIds.clear();
    unfinishedFiles.clear();
    setFileIdsLocally(givenFileIds);
  }, [givenFileIds, setFileIdsLocally, unfinishedFiles, uploadIds]);

  return {
    isUploading,
    uploadFile,
    clearUploads,
    fileIds,
    uploadProgressProps,
    postAttachmentsProps,
  };
}

const selectFileSizeLimit = (serverInfo) => serverInfo.attachments.fileSizeLimit;

function checkFileSize(file, maxFileSize) {
  if (file.size <= maxFileSize) {
    return null;
  }
  const sizMiB = (file.size / (1 << 20)).toFixed(2);
  const maxMiB = maxFileSize >> 20;
  return `File is too big: ${sizMiB} MiB, max accepted size: ${maxMiB} MiB`;
}
