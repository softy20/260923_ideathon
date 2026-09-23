import { UI, genreLabel, scheduleGroups } from "../lib/i18n";

export default function PerformanceCard({ performance, lang = "en" }) {
  const {
    nameEn,
    nameKo,
    dateDisplay,
    venueEn,
    venueKo,
    mapsQuery,
    price,
    priceText,
    noKoreanNeeded,
    bookingUrl,
    poster,
  } = performance;

  const t = UI[lang];
  const title = lang === "ko" ? nameKo : nameEn;
  const subtitle = lang === "ko" ? nameEn : nameKo;
  const venue = lang === "ko" ? venueKo : venueEn;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery
  )}`;

  return (
    <article className="card">
      <div className="card-poster">
        {poster ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="card-poster-bg" src={poster} alt="" aria-hidden="true" loading="lazy" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="card-poster-fg" src={poster} alt={`${nameEn} poster`} loading="lazy" />
          </>
        ) : (
          <div className="card-poster-fallback">No image</div>
        )}
        <div className="card-badges">
          <span className="badge">{genreLabel(performance, lang)}</span>
          {noKoreanNeeded && (
            <span className="badge badge-accent">{t.noKoreanNeeded}</span>
          )}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        {subtitle && subtitle !== title && <p className="card-title-ko">{subtitle}</p>}

        <div className="schedule-chips">
          {scheduleGroups(dateDisplay, lang).map((g, i) => (
            <span className="schedule-chip" key={i}>
              <span className="schedule-chip-day">{g.day}</span>
              {g.times && <span className="schedule-chip-time">{g.times}</span>}
            </span>
          ))}
        </div>
        <a
          className="card-line card-venue"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          📍 {venue}
        </a>

        <div className="card-footer">
          <p className="card-price" title={priceText}>
            {t.from} ₩{price?.toLocaleString()}
          </p>

          {bookingUrl ? (
            <a className="card-cta" href={bookingUrl} target="_blank" rel="noreferrer">
              {t.bookTickets}
            </a>
          ) : (
            <span className="card-cta card-cta-disabled">{t.noBookingLink}</span>
          )}
        </div>
      </div>
    </article>
  );
}
