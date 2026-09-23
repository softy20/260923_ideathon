export default function PerformanceCard({ performance }) {
  const {
    nameEn,
    nameKo,
    dateDisplay,
    venueEn,
    mapsQuery,
    price,
    priceText,
    genreEn,
    noKoreanNeeded,
    bookingUrl,
    poster,
  } = performance;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery
  )}`;

  return (
    <article className="card">
      <div className="card-poster">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={`${nameEn} poster`} loading="lazy" />
        ) : (
          <div className="card-poster-fallback">No image</div>
        )}
        <div className="card-badges">
          <span className="badge">{genreEn}</span>
          {noKoreanNeeded && <span className="badge badge-accent">No Korean needed</span>}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{nameEn}</h3>
        {nameKo && nameKo !== nameEn && <p className="card-title-ko">{nameKo}</p>}

        <p className="card-line">{dateDisplay}</p>
        <a
          className="card-line card-venue"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          📍 {venueEn}
        </a>

        <p className="card-price" title={priceText}>
          from ₩{price?.toLocaleString()}
        </p>

        {bookingUrl ? (
          <a className="card-cta" href={bookingUrl} target="_blank" rel="noreferrer">
            Book tickets →
          </a>
        ) : (
          <span className="card-cta card-cta-disabled">No booking link</span>
        )}
      </div>
    </article>
  );
}
