/* global describe, it, expect */
import { render } from '@testing-library/react';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { Attachments } from '../../src/components/post/attachments/attachments';

function renderPostAttachments(attachments = []) {
  const state = { attachments: attachments.reduce((p, a) => ({ ...p, [a.id]: a }), {}) };
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, state);
  return render(
    <Provider store={store}>
      <Attachments attachmentIds={attachments.map((a) => a.id)} />
    </Provider>,
  );
}

describe('PostAttachments', () => {
  it('Renders an empty attachments container', () => {
    const { asFragment } = renderPostAttachments();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Displays all post attachment types', () => {
    const image1 = {
      id: 'im1',
      mediaType: 'image',
      fileName: 'CAT.jpg',
      fileSize: 200000,
      previewTypes: ['image'],
      width: 2000,
      height: 1500,
    };

    const image2 = {
      id: 'im2',
      mediaType: 'image',
      fileName: 'food.jpg',
      fileSize: 2000,
      previewTypes: ['image'],
      width: 2000,
      height: 1500,
    };

    const video1 = {
      id: 'vi1',
      mediaType: 'video',
      fileName: 'sunrise.mp4',
      fileSize: 123456789,
      previewTypes: ['image', 'video'],
      duration: 123,
      width: 1920,
      height: 1080,
    };

    const audio1 = {
      id: 'au1',
      mediaType: 'audio',
      fileName: 'wonderwall.mp3',
      fileSize: 1234567,
      previewTypes: ['audio'],
      duration: 300,
      meta: {
        'dc:creator': 'Oasis',
        'dc:title': 'Wonderwall',
      },
    };

    const general1 = {
      id: 'ge1',
      mediaType: 'general',
      fileName: 'rfc.pdf',
      fileSize: 50000,
      previewTypes: [],
    };

    const { asFragment } = renderPostAttachments([video1, image1, general1, image2, audio1]);
    expect(asFragment()).toMatchSnapshot();
  });
});
