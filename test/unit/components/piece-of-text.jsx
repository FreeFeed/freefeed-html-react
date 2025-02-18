import { describe, it } from 'vitest';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';

import PieceOfText from '../../../src/components/piece-of-text';
import Spoiler from '../../../src/components/spoiler';
import Linkify from '../../../src/components/linkify';
import { ButtonLink } from '../../../src/components/button-link';
import ErrorBoundary from '../../../src/components/error-boundary';
import CodeBlock from '../../../src/components/code-block';
import { MediaLink } from '../../../src/components/media-links/media-link';

const expect = unexpected.clone().use(unexpectedReact);

describe('<PieceOfText>', () => {
  it('should correctly process multiline texts (short text with newlines)', () => {
    const text =
      '\n\n\n\n First paragraph \n\n\n Second paragraph, first line \n Second paragraph, second line \n\n';

    expect(
      <PieceOfText text={text} />,
      'when rendered',
      'to have rendered with all children',
      <Linkify>
        <span>First paragraph Second paragraph, first line Second paragraph, second line</span>{' '}
        <ButtonLink className="read-more">Expand</ButtonLink>
      </Linkify>,
    );

    expect(
      <PieceOfText text={text} isExpanded />,
      'when rendered',
      'to have rendered with all children',
      <Linkify>{text.trim()}</Linkify>,
    );
  });

  it('should correctly process multiline texts (long text without newlines)', () => {
    const text =
      '1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329 Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений, Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. "Мой дядя самых 596 честных правил, Когда не в шутку 633 занемог, Он уважать себя заставил 671 И лучше выдумать не мог. Его 704 пример другим наука; Но, боже 738 мой, какая скука С больным сидеть 776 и день и ночь, Не отходя ни 808 шагу прочь! Какое низкое коварство 847 Полу-живого забавлять, Ему подушки поправлять, 898 Печально подносить лекарство, Вздыхать и думать 950 про себя: Когда же чорт 978 возьмет тебя!" II.';

    expect(
      <PieceOfText text={text} />,
      'when rendered',
      'to have rendered with all children',
      <Linkify>
        <span>
          1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе
          представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной
          мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой
          пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329
          Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений,
          Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА
          ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. {`"`}Мой дядя
          самых...
        </span>{' '}
        <ButtonLink className="read-more">Read more</ButtonLink>
      </Linkify>,
    );

    expect(
      <PieceOfText text={text} isExpanded />,
      'when rendered',
      'to have rendered with all children',
      <Linkify>{text}</Linkify>,
    );
  });

  it('should correctly process single-line texts', () => {
    const text = 'ururu n ururu3';

    expect(
      <PieceOfText text={text} />,
      'when rendered',
      'to have rendered with all children',
      <Linkify>{text}</Linkify>,
    );
  });

  it('should correctly process texts with markup', () => {
    const text = 'ururu <b>n</b> ururu3';

    expect(
      <PieceOfText text={text} />,
      'when rendered',
      'to have rendered with all children',
      <Linkify>{text}</Linkify>,
    );
  });

  it('should correctly process texts with spoilers', () => {
    const text =
      '123 <spoiler> <spoiler>456</spoiler> 789 <спойлер>https://example.com</спойлер> 123';

    expect(
      <Linkify>{text}</Linkify>,
      'when rendered',
      'to have rendered with all children',
      <span>
        <ErrorBoundary>
          {'123 <spoiler> <spoiler>'}
          <Spoiler>456</Spoiler>
          {'</spoiler> 789 <спойлер>'}
          <Spoiler>
            <MediaLink href="https://example.com/">example.com</MediaLink>
          </Spoiler>
          {'</спойлер> 123'}
        </ErrorBoundary>
      </span>,
    );
  });

  it('should correctly process texts with inline code', () => {
    const code = '1+1=2; foo(); @mention user@example.com #hashtag ^ <spoiler>https://example.com';
    const text = `Here is the code \`${code}\`. </spoiler> Read it carefully`;
    expect(
      <Linkify>{text}</Linkify>,
      'when rendered',
      'to have rendered with all children',
      <span>
        <ErrorBoundary>
          {'Here is the code '}
          <code>
            <span className="code--backticks">`</span>
            {code}
            <span className="code--backticks">`</span>
          </code>
          {'. </spoiler> Read it carefully'}
        </ErrorBoundary>
      </span>,
    );
  });

  it('should correctly process texts with code blocks', () => {
    const codeBlock =
      '```\n1+1=2; foo(); @mention \n user@example.com \n\n #hashtag \n ^ \n\n <spoiler>https://example.com\n```';
    const text = `Here is the code block\n ${codeBlock}\n</spoiler> Read it carefully`;
    expect(
      <Linkify>{text}</Linkify>,
      'when rendered',
      'to have rendered with all children',
      <span>
        <ErrorBoundary>
          {'Here is the code block'}
          <no-display-name>
            {' '}
            <br />
          </no-display-name>
          <CodeBlock text={codeBlock} />
          <no-display-name>
            {' '}
            <br />
          </no-display-name>
          {'</spoiler> Read it carefully'}
        </ErrorBoundary>
      </span>,
    );
  });
});
