/* global CONFIG */
import { Link } from 'react-router';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';

import styles from './donate.module.scss';
import { useDonationStatus } from './hooks/donation-status';
import { useBool } from './hooks/bool';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';
import { faLiberaPay, faYooMoney } from './fontawesome-custom-icons';

const cfg = CONFIG.donations;

export default function Donate({ donationAccountName = cfg.statusAccount }) {
  const statusText = useDonationStatus(donationAccountName);
  const [rusDetailsOpened, rusDetailsToggle] = useBool(false);
  const [engDetailsOpened, engDetailsToggle] = useBool(false);

  return (
    <div className="box">
      <div className="box-header-timeline" />
      <div className="box-body">
        <h3>Donate to FreeFeed</h3>

        <p>
          <a href="#russian">🇷🇺 Прочесть по-русски</a>
        </p>

        <p>
          <Link to="/about">FreeFeed</Link> is a small-scale social network and a blogging platform.
          It is maintained by a non-profit organization FreeFeed MTU and is funded by voluntary
          donations from its users. These donations are the only source of income for FreeFeed as it
          has no sponsors and doesn&apos;t run ads.
        </p>

        {cfg.reportsAccount && (
          <p>
            <Link to={`/${cfg.reportsAccount}`}>See funding and expenses reports</Link>
          </p>
        )}

        <p>
          All hosting expenses are covered by donations only. You can help us pay for hosting by
          setting up a monthly donation.
        </p>

        {statusText && (
          <>
            <p>
              Current funding status:{' '}
              <span className={styles.statusLink} data-status={statusText}>
                {statusText}
              </span>{' '}
              <ButtonLink onClick={engDetailsToggle}>
                What does it mean?{engDetailsOpened && ' (collapse)'}
              </ButtonLink>
            </p>
            <section className={styles.statusDetails} hidden={!engDetailsOpened}>
              <p>
                FreeFeed expenses fall into three main categories: hosting expenses, administration
                expenses such as banking and accounting fees, and expenses for development of new
                features. We also use the term &quot;reserve fund&quot; to describe the amount of
                money that we need to run FreeFeed for a year, including hosting and administration
                expenses. As of February of 2021, this amount is 1700 EUR.
              </p>
              <p>
                Funding statuses show how well the monthly donations we receive match our monthly
                expenses.
              </p>
              <p>
                <strong>Very good</strong> means that we&apos;ve met our reserve fund goal. We had
                enough donations last month to cover monthly hosting fees, and at least 800 EUR
                extra to pay for the development of new features.
              </p>
              <p>
                <strong>Good</strong> means that we&apos;ve met our reserve fund goal. We had enough
                donations last month to cover monthly hosting fees, and at least 400 EUR extra to
                pay for the development of new features.
              </p>
              <p>
                <strong>OK</strong> means that we&apos;ve met our reserve fund goal. We had enough
                donations last month to cover monthly hosting fees, and we had about 200 EUR extra.
                This is not enough to pay for the development of new features this month, but we can
                save up and do it later.
              </p>
              <p>
                <strong>Low</strong> means that we&apos;ve met our reserve fund goal, we had enough
                donations last month to cover monthly hosting fees, but we cannot afford to paying
                for anything else.
              </p>
              <p>
                <strong>Very low</strong> means that we&apos;ve met our reserve fund goal, but we
                did not have enough donations last month to cover monthly hosting fees. This means
                we are using our reserves, or will have to start using them soon.
              </p>
              <p>
                <strong>Critical</strong> means that we only have enough money left in our reserves
                to run FreeFeed for a few months, and our future is at risk.
              </p>
            </section>
          </>
        )}

        {cfg.paymentMethods.liberaPayProject && (
          <>
            <h4>The easy way (all cards, 20% commission fee)</h4>

            <form
              method="get"
              action={`https://liberapay.com/${cfg.paymentMethods.liberaPayProject}/donate`}
              target="_blank"
            >
              <button type="submit">
                <Icon icon={faLiberaPay} /> Pay with LiberaPay
              </button>
            </form>
          </>
        )}

        {cfg.paymentMethods.payPalRegularButtonId && (
          <>
            <h4>The Paypal way (7% commission fee)</h4>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <p>
                <input type="hidden" name="cmd" value="_s-xclick" />
                <input
                  type="hidden"
                  name="hosted_button_id"
                  value={cfg.paymentMethods.payPalRegularButtonId}
                />
                <input type="hidden" name="currency_code" value="EUR" />
                <input type="hidden" name="on0" value="Pick monthly donation amount" />
                <select name="os0" style={{ marginBottom: '0.5em' }}>
                  <option value="Entry Level Supporter">€5.00 EUR / month</option>
                  <option value="Basic Level Supporter">€10.00 EUR / month</option>
                  <option value="Standard Level Supporter">€15.00 EUR / month</option>
                  <option value="Pro Supporter">€20.00 EUR / month</option>
                  <option value="Master Supporter">€30.00 EUR / month</option>
                  <option value="Honorable Supporter">€50.00 EUR / month</option>
                  <option value="Master Donator">€75.00 EUR / month</option>
                  <option value="Chuck Norris">€100.00 EUR / month</option>
                </select>
                <br />
                <button type="submit">
                  <Icon icon={faPaypal} /> Pay with PayPal
                </button>
              </p>
            </form>
          </>
        )}

        {cfg.paymentMethods.payPalOneTimeButtonId && (
          <>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <input type="hidden" name="cmd" value="_s-xclick" />
              <input
                type="hidden"
                name="hosted_button_id"
                value={cfg.paymentMethods.payPalOneTimeButtonId}
              />
              <p>
                Alternatively, you can make a one-time PayPal donation:
                <br />
                <button type="submit">
                  <Icon icon={faPaypal} /> Pay with PayPal
                </button>
              </p>
            </form>
          </>
        )}

        <h4>The responsible way (commission fees depend on your bank)</h4>
        <p>
          You can set up recurring monthly donation through your internet bank account.
          <br />
          Payment details:
          <br />
          Organization name: <code>FREEFEED.NET MTÜ</code>
          <br />
          IBAN: <code>EE982200221062037450</code>
          <br />
          SWIFT Code: <code>HABAEE2X</code>
          <br />
          Legal address: <code>Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
        </p>

        {cfg.paymentMethods.yasobeRuProject && (
          <>
            <h4>The Russian way (2% commission fee)</h4>
            <form
              method="get"
              action={`https://yasobe.ru/na/${cfg.paymentMethods.yasobeRuProject}`}
              target="_blank"
            >
              <p>
                You can make a one-time payment with your card or YooMoney wallet:
                <br />
                <button type="submit">
                  <Icon icon={faYooMoney} /> Pay with YooMoney
                </button>
              </p>
            </form>
          </>
        )}

        <p>Thank you!</p>

        <h3 id="russian">Помочь Фрифиду</h3>

        <p>
          <Link to="/about">FreeFeed</Link> - это небольшая социальная сеть и блог-платформа без
          рекламы и цензуры. Она создана и поддерживается некоммерческой организацией волонтеров
          FreeFeed MTU на средства, которые добровольно жертвуют пользователи — это единственный
          источник денег, у нас нет спонсоров и рекламы.
        </p>

        {cfg.reportsAccount && (
          <p>
            <Link to={`/${cfg.reportsAccount}`}>Отчеты о расходах и собираемых средствах</Link>
          </p>
        )}

        <p>Вы можете помочь нам, настроив автоматический ежемесячный платёж</p>

        {statusText && (
          <>
            <p>
              Текущее состояние финансов:{' '}
              <span className={styles.statusLink} data-status={statusText}>
                {statusText}
              </span>{' '}
              <ButtonLink onClick={rusDetailsToggle}>
                Что это значит?{rusDetailsOpened && ' (закрыть)'}
              </ButtonLink>
            </p>
            <section className={styles.statusDetails} hidden={!rusDetailsOpened}>
              <p>
                Расходы FreeFeed сводятся к трем основным категориям: затраты на хостинг,
                организационные расходы (банк, бухгалтер) и расходы на разработку новых
                возможностей. Кроме того, есть понятие “резервный фонд”, который содержит
                достаточное количество денег, чтобы оплачивать год хостинга и организационных
                расходов. На февраль 2021 года резервный фонд составляет 1700 евро.
              </p>
              <p>
                Уровни финансирования показывают, насколько собираемые ежемесячно средства позволяют
                оплачивать эти статьи расходов.
              </p>
              <p>
                <strong>Very good</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и ещё как минимум 800 евро остается для оплаты
                разработки новых возможностей.
              </p>
              <p>
                <strong>Good</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и ещё как минимум 400 евро остается для оплаты
                разработки новых возможностей.
              </p>
              <p>
                <strong>OK</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и ещё остается около 200 евро. На оплату разработки
                новых возможностей в этом месяце этого не хватит, но можно накопить и потом
                потратить на разработку.
              </p>
              <p>
                <strong>Low</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и только.
              </p>
              <p>
                <strong>Very low</strong> означает, что резервный фонд заполнен, но собираемых
                ежемесячно денег недостаточно для оплаты хостинга. Это значит, что мы тратим или
                скоро начнем тратить резервный фонд.
              </p>
              <p>
                <strong>Critical</strong> означает, что в резервном фонде осталось денег на
                несколько месяцев, и дальнейшее существование FreeFeed под угрозой.
              </p>
            </section>
          </>
        )}

        {cfg.paymentMethods.liberaPayProject && (
          <>
            <h4>Простой способ (принимает все карты, комиссии ~20%)</h4>

            <form
              method="get"
              action={`https://liberapay.com/${cfg.paymentMethods.liberaPayProject}/donate`}
              target="_blank"
            >
              <button type="submit">
                <Icon icon={faLiberaPay} /> Pay with LiberaPay
              </button>
            </form>
          </>
        )}

        {cfg.paymentMethods.payPalRegularButtonId && (
          <>
            <h4>Paypal (комиссия ~7%)</h4>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <p>
                <input type="hidden" name="cmd" value="_s-xclick" />
                <input
                  type="hidden"
                  name="hosted_button_id"
                  value={cfg.paymentMethods.payPalRegularButtonId}
                />
                <input type="hidden" name="currency_code" value="EUR" />
                <select name="os0" style={{ marginBottom: '0.5em' }}>
                  <option value="Entry Level Supporter">€5.00 EUR / month</option>
                  <option value="Basic Level Supporter">€10.00 EUR / month</option>
                  <option value="Standard Level Supporter">€15.00 EUR / month</option>
                  <option value="Pro Supporter">€20.00 EUR / month</option>
                  <option value="Master Supporter">€30.00 EUR / month</option>
                  <option value="Honorable Supporter">€50.00 EUR / month</option>
                  <option value="Master Donator">€75.00 EUR / month</option>
                  <option value="Chuck Norris">€100.00 EUR / month</option>
                </select>
                <br />
                <button type="submit">
                  <Icon icon={faPaypal} /> Заплатить через PayPal
                </button>
              </p>
            </form>
          </>
        )}

        {cfg.paymentMethods.payPalOneTimeButtonId && (
          <>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <input type="hidden" name="cmd" value="_s-xclick" />
              <input
                type="hidden"
                name="hosted_button_id"
                value={cfg.paymentMethods.payPalOneTimeButtonId}
              />
              <p>
                Или вы можете сделать единовременный взнос:
                <br />
                <button type="submit">
                  <Icon icon={faPaypal} /> Заплатить через PayPal
                </button>
              </p>
            </form>
          </>
        )}

        <h4>Прямой платеж (комиссии зависят от вашего банка)</h4>
        <p>
          Вы можете настроить регулярные ежемесячные платежи в вашем интернет-банке.
          <br />
          Реквизиты:
          <br />
          Получатель платежа: <code>FREEFEED.NET MTÜ</code>
          <br />
          IBAN: <code>EE982200221062037450</code>
          <br />
          Код SWIFT: <code>HABAEE2X</code>
          <br />
          Адрес получателя: <code>Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
        </p>

        {cfg.paymentMethods.yasobeRuProject && (
          <>
            <h4>ЮMoney (комиссия ~2%)</h4>
            <form
              method="get"
              action={`https://yasobe.ru/na/${cfg.paymentMethods.yasobeRuProject}`}
              target="_blank"
            >
              <p>
                Вы можете сделать единоразовый платеж с помощью платежной карточки или кошелька
                ЮMoney:
                <br />
                <button type="submit">
                  <Icon icon={faYooMoney} /> Сделать взнос через ЮMoney
                </button>
              </p>
            </form>
          </>
        )}

        <p>Спасибо!</p>
      </div>
    </div>
  );
}
