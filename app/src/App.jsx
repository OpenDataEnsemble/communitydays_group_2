import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sprout
} from 'lucide-react';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

import config from './theme.json';
import useObservations from './useObservations.js';

function display(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(display).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function Fields({ fields, data }) {
  return (
    <dl className="fields">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>{display(data?.[key])}</dd>
        </div>
      ))}
    </dl>
  );
}

function RecordPage() {
  const { entityId } = useParams();

  const {
    api,
    registrations,
    followUps,
    loading,
    error,
    formError,
    opening,
    refresh,
    openForm
  } = useObservations(entityId);

  const [searchTerm, setSearchTerm] = useState('');

  const record = registrations.find(
    (item) => item.observationId === entityId
  );

  const disabled = !api || opening;

  const registrationFields = config.registrationFields.some(
    ({ key }) => key === 'name'
  )
    ? config.registrationFields
    : [{ key: 'name', label: 'Name' }, ...config.registrationFields];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredRegistrations = normalizedSearch
    ? registrations.filter((item) =>
        String(item.data?.name ?? '')
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : registrations;

  useEffect(() => {
    document.title = entityId
      ? `${config.entity} details · ${config.title}`
      : config.title;

    document.getElementById('page-heading')?.focus();
  }, [entityId]);

  return (
    <>
      {entityId && (
        <Link className="back-link" to="/">
          <ArrowLeft size={17} aria-hidden="true" />
          All {config.plural}
        </Link>
      )}

      <section
        className={`panel ${entityId ? 'detail-panel' : 'community-panel'}`}
        aria-labelledby="page-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {entityId ? `${config.entity} profile` : 'Your community'}
            </p>

            <div className="heading-with-count">
              <h2 id="page-heading" tabIndex={-1}>
                {entityId
                  ? display(
                      record?.data?.name ||
                        `${config.entity} details`
                    )
                  : config.plural.charAt(0).toUpperCase() +
                    config.plural.slice(1)}
              </h2>

              {!entityId && (
                <span className="count-badge">
                  {registrations.length}
                </span>
              )}
            </div>

            {entityId && record && (
              <div className="record-meta">
                {record.data?.crop && (
                  <span>
                    <Sprout size={15} aria-hidden="true" />
                    {display(record.data.crop)}
                  </span>
                )}

                {record.data?.location && (
                  <span>
                    <MapPin size={15} aria-hidden="true" />
                    {display(record.data.location)}
                  </span>
                )}
              </div>
            )}
          </div>

          {!entityId && (
            <button
              className="primary-button"
              disabled={disabled}
              onClick={() => openForm(config.registrationForm)}
            >
              <Plus size={18} aria-hidden="true" />
              {opening ? 'Form open…' : config.registerLabel}
            </button>
          )}
        </div>

        <div className="data-status">
          <span role="status">
            {loading
              ? 'Refreshing saved observations…'
              : `${registrations.length} saved ${config.plural}`}
          </span>

          <button
            className="secondary icon-action"
            disabled={loading || opening}
            onClick={refresh}
          >
            <RefreshCw
              size={16}
              className={loading ? 'spin' : ''}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>

        {!api && (
          <p className="notice">
            Open this app in Formulus or ODE Desktop to view and collect data.
            This browser preview does not contain sample data.
          </p>
        )}

        {error && (
          <div className="error" role="alert">
            <p>Could not refresh observations. {error}</p>

            {(registrations.length > 0 || followUps.length > 0) && (
              <p>
                Previously loaded data is shown; it may be out of date.
              </p>
            )}

            <button
              className="secondary"
              disabled={loading}
              onClick={refresh}
            >
              Retry
            </button>
          </div>
        )}

        {formError && (
          <p className="error" role="alert">
            Could not complete the form. {formError} Please try the form
            button again.
          </p>
        )}

        {!entityId ? (
          <>
            {registrations.length > 0 && (
              <div className="search-block">
                <label htmlFor="garden-search">
                  Find a garden
                </label>

                <div className="search-control">
                  <Search size={19} aria-hidden="true" />

                  <input
                    id="garden-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search by garden name"
                    autoComplete="off"
                  />
                </div>

                {normalizedSearch && (
                  <span className="search-result-count" role="status">
                    {filteredRegistrations.length}{' '}
                    {filteredRegistrations.length === 1
                      ? 'match'
                      : 'matches'}
                  </span>
                )}
              </div>
            )}

            {registrations.length > 0 ? (
              filteredRegistrations.length > 0 ? (
                <div
                  className="table-scroll"
                  role="region"
                  aria-label={`${config.plural} list`}
                  tabIndex={0}
                >
                  <table>
                    <caption>Saved {config.plural}</caption>

                    <thead>
                      <tr>
                        {config.columns.map(({ key, label }) => (
                          <th scope="col" key={key}>
                            {label}
                          </th>
                        ))}
                        <th scope="col">Details</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRegistrations.map((item) => (
                        <tr key={item.observationId}>
                          {config.columns.map(({ key, label }) => (
                            <td key={key} data-label={label}>
                              {display(item.data?.[key])}
                            </td>
                          ))}

                          <td data-label="Details">
                            <Link
                              className="detail-link"
                              to={`/details/${encodeURIComponent(
                                item.observationId
                              )}`}
                              aria-label={`View details for ${display(
                                item.data?.name
                              )}`}
                            >
                              View details
                              <ChevronRight
                                size={17}
                                aria-hidden="true"
                              />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty" role="status">
                  <Search size={24} aria-hidden="true" />
                  <strong>No gardens found</strong>
                  <span>
                    No gardens match “{searchTerm.trim()}”.
                  </span>
                </div>
              )
            ) : (
              !loading &&
              !error &&
              api && (
                <div className="empty">
                  <Sprout size={26} aria-hidden="true" />
                  <strong>No gardens yet</strong>
                  <span>
                    Select “{config.registerLabel}” to get started.
                  </span>
                </div>
              )
            )}
          </>
        ) : record ? (
          <>
            <div className="details-card">
              <div className="details-card-heading">
                <div>
                  <p className="eyebrow">Garden information</p>
                  <h3>Profile details</h3>
                </div>

                <Sprout size={23} aria-hidden="true" />
              </div>

              <Fields
                fields={registrationFields}
                data={record.data}
              />
            </div>

            <div className="section-heading history-heading">
              <div>
                <p className="eyebrow">Activity</p>

                <div className="heading-with-count">
                  <h3>Follow-up timeline</h3>

                  <span className="count-badge">
                    {followUps.length}
                  </span>
                </div>
              </div>

              <button
                className="primary-button"
                disabled={
                  disabled ||
                  loading ||
                  Boolean(error)
                }
                onClick={() =>
                  openForm(config.followUpForm, {
                    entity_id: record.observationId
                  })
                }
              >
                <Plus size={18} aria-hidden="true" />
                {opening
                  ? 'Form open…'
                  : config.followUpLabel}
              </button>
            </div>

            {followUps.length === 0 ? (
              <div className="empty follow-up-empty">
                <ClipboardList size={27} aria-hidden="true" />
                <strong>No saved follow-ups yet</strong>
                <span>
                  Record a garden visit to start building its history.
                </span>
              </div>
            ) : (
              <ol className="history">
                {followUps.map((item) => {
                  const date = new Date(item.createdAt);

                  return (
                    <li key={item.observationId}>
                      <article>
                        <div className="history-title">
                          <CalendarDays
                            size={18}
                            aria-hidden="true"
                          />

                          <h4>
                            {Number.isNaN(date.getTime()) ? (
                              'Saved follow-up'
                            ) : (
                              <time
                                dateTime={date.toISOString()}
                              >
                                {date.toLocaleString()}
                              </time>
                            )}
                          </h4>
                        </div>

                        <Fields
                          fields={config.followUpFields}
                          data={item.data}
                        />
                      </article>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        ) : (
          !loading &&
          !error &&
          api && (
            <div className="empty">
              <Sprout size={26} aria-hidden="true" />
              <strong>Garden not found</strong>
              <span>
                It may have been deleted or may not have synced to this
                device.
              </span>
            </div>
          )
        )}
      </section>
    </>
  );
}

export default function App() {
  return (
    <div
      className="app"
      style={{
        '--accent': config.accent,
        '--background': config.background
      }}
    >
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document
            .getElementById('main-content')
            ?.focus();
        }}
      >
        Skip to content
      </a>

      <header className="site-header">
        <div className="header-brand">
          <Link
            className="brand"
            to="/"
            aria-label="Community app home"
          >
            <img
              src="./assets/ode-logo.png"
              alt="Open Data Ensemble"
            />
          </Link>

          <div className="product-name">
            <strong>{config.title}</strong>
            <span>Urban agriculture</span>
          </div>
        </div>

        <span className="event-pill">
          ODE Community Days 2026, Kampala
        </span>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section
          className="hero"
          aria-labelledby="app-title"
        >
          <img
            className="hero-image"
            src="./assets/garden-hero.jpg"
            alt=""
          />

          <div className="hero-shade" />

          <div className="hero-content">
            <span className="hero-kicker">
              <Sprout size={14} aria-hidden="true" />
              {config.theme}
            </span>

            <h1 id="app-title">
              {config.title}
            </h1>

            <p>{config.description}</p>
          </div>

          <span className="hero-badge">
            Local-first garden records
          </span>
        </section>

        <Routes>
          <Route
            path="/"
            element={<RecordPage />}
          />

          <Route
            path="/details/:entityId"
            element={<RecordPage />}
          />

          <Route
            path="*"
            element={
              <section className="panel">
                <h2>Page not found</h2>
                <Link to="/">Return home</Link>
              </section>
            }
          />
        </Routes>
      </main>

      <footer>
        Built together with{' '}
        <strong>Open Data Ensemble</strong>
        <span> · </span>
        Collect locally, connect your community.
      </footer>
    </div>
  );
}
