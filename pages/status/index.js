import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

function StatusPage() {
  const particlesRef = useRef([]);
  const starsStateRef = useRef([]);
  const isMobile = useIsMobile();
  const particlesCount = isMobile ? 50 : 100;

  const { data, isLoading, error } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  useEffect(() => {
    const stars = particlesRef.current;

    starsStateRef.current = stars.map(() => {
      const r = Math.random();
      let dirX = 0;
      let dirY = 1;

      if (r < 0.33) dirX = 0;
      else if (r < 0.66) dirX = 0.7;
      else dirX = -0.7;

      return {
        x: Math.random(),
        y: Math.random(),
        speed: 0.07 + Math.random() * 0.01,
        dirX,
        dirY,
      };
    });

    let lastTime = performance.now();

    const animate = (time) => {
      const rawDt = (time - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05);
      lastTime = time;

      const width = window.innerWidth;
      const height = window.innerHeight;

      stars.forEach((el, index) => {
        if (!el) return;

        const star = starsStateRef.current[index];

        const len = Math.hypot(star.dirX, star.dirY) || 1;
        const vx = (star.dirX / len) * star.speed;
        const vy = (star.dirY / len) * star.speed;

        star.x += vx * dt;
        star.y += vy * dt;

        if (star.y > 1.1 || star.x > 1.2 || star.x < -0.2) {
          star.x = Math.random();
          star.y = -0.1;
          star.speed = 0.07 + Math.random() * 0.01;

          const r = Math.random();
          let dirX = 0;
          let dirY = 1;

          if (r < 0.33) dirX = 0;
          else if (r < 0.66) dirX = 0.7;
          else dirX = -0.7;

          star.dirX = dirX;
          star.dirY = dirY;
        }

        const px = star.x * width;
        const py = star.y * height;

        el.style.transform = `translate(${px}px, ${py}px)`;
      });

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [particlesCount]);

  return (
    <>
      <style>{`
        h1 {
          font-size: 2.25rem;
          font-weight: bold;
          margin-bottom: 16px;
        }

        html, body {
          margin: 0;
          padding: 0;
          background-color: #121212;
          overflow: hidden;
        }

        .background-wrapper {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: linear-gradient(45deg, #121212 0%, #3a1360 100%);
          pointer-events: none;
        }

        .bg-layer {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 0% 0%, rgba(76, 29, 149, 0.10), transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(14, 165, 233, 0.08), transparent 60%);
          background-size: 200% 200%;
          filter: blur(8px);
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        }

        .status-card {
          background-color: #1f1f1f;
          padding: 32px 24px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          border: 1px solid #2c2c2c;
          max-width: 700px;
          width: 100%;
          text-align: center;          
        }

        .status-title {
          display: inline-flex;        
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .status-description {
          font-size: 1rem;
          margin: 0 0 40px 0;
          color: #d0d0d0;
        }

        .status-updated {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 12px;
          font-size: 0.85rem;
        }

        .status-updated__label {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
          color: #71717a;
        }

        .status-updated__value {
          font-variant-numeric: tabular-nums;
          color: #f5f5f5;
        }

        .status-error {
          margin-bottom: 12px;
          padding: 8px 10px;
          border-radius: 10px;
          background: #451a1a;
          color: #fecaca;
          font-size: 0.85rem;
        }

        .status-section {
          margin-top: 8px;
        }

        .status-section__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .status-section__title {
          margin: 0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #e4e4e7;
        }

        .status-pill {
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border: 1px solid transparent;
        }

        .status-pill--ok {
          background: rgba(15, 15, 15, 0.9);         
          border-color: rgba(34, 197, 94, 0.9);       
          color: #bbf7d0;                            
          box-shadow:
            0 0 0 1px rgba(34, 197, 94, 0.5),        
            0 0 12px rgba(34, 197, 94, 0.35);         
        }

        .status-pill--warning {
          background: rgba(248, 180, 112, 0.12);
          border-color: rgba(251, 146, 60, 0.8);
          color: #fed7aa;
        }

        .status-pill--loading {
          background: rgba(161, 161, 170, 0.22);
          border-color: rgba(113, 113, 122, 0.8);
          color: #e4e4e7;
        }

        .status-rows {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .status-row__label {
          color: #a1a1aa;
        }

        .status-row__value {
          color: #e4e4e7;
          font-variant-numeric: tabular-nums;
        }

        .status-usage {
          margin-top: 10px;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: #27272a;
          overflow: hidden;
        }

        .status-usage__fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.25s ease-out;
        }

        .status-usage__fill--warning {
          background: linear-gradient(90deg, #f97316, #ef4444);
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.6rem;
            line-height: 1.2;
          }

          .status-card {
            padding: 24px 18px;
          }
        }
      `}</style>

      <div className="background-wrapper">
        <div className="bg-layer" />
        {Array.from({ length: particlesCount }).map((_, i) => (
          <div
            key={i}
            className="particle"
            ref={(el) => (particlesRef.current[i] = el)}
          />
        ))}
      </div>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          fontFamily: "Arial, sans-serif",
          backgroundColor: "transparent",
          color: "#f5f5f5",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="status-card">
          <div className="status-title">
            <h1 style={{ marginBottom: 0 }}> 📊 Status do Sistema 🌐</h1>
          </div>

          <p className="status-description">
            Acompanhe a saúde da infraestrutura em tempo real.
          </p>

          <UpdatedAt isLoading={isLoading} data={data} />

          {error && (
            <div className="status-error">
              ⚠️ Erro ao carregar o status. Tentando novamente...
            </div>
          )}

          <DatabaseStatus isLoading={isLoading} data={data} />
        </div>
      </div>
    </>
  );
}

function UpdatedAt({ isLoading, data }) {
  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  }

  return (
    <div className="status-updated">
      <span className="status-updated__label">Última atualização</span>
      <span className="status-updated__value">{updatedAtText}</span>
    </div>
  );
}

function DatabaseStatus({ isLoading, data }) {
  if (isLoading || !data) {
    return (
      <div className="status-section">
        <div className="status-section__header">
          <h2 className="status-section__title">Banco de dados</h2>
          <span className="status-pill status-pill--loading">
            Carregando...
          </span>
        </div>
      </div>
    );
  }

  const db = data.dependencies.database;
  const usagePercent = Math.round(
    (db.opened_connections / db.max_connections) * 100,
  );

  const isHighUsage = usagePercent >= 80;
  const pillClass = isHighUsage
    ? "status-pill status-pill--warning"
    : "status-pill status-pill--ok";
  const pillText = isHighUsage ? "Alta utilização" : "Operacional";

  return (
    <div className="status-section">
      <div className="status-section__header">
        <h2 className="status-section__title">Banco de dados</h2>
        <span className={pillClass}>{pillText}</span>
      </div>

      <div className="status-rows">
        <div className="status-row">
          <span className="status-row__label">Versão</span>
          <span className="status-row__value">{db.version}</span>
        </div>

        <div className="status-row">
          <span className="status-row__label">Conexões</span>
          <span className="status-row__value">
            {db.opened_connections} / {db.max_connections} ({usagePercent}%)
          </span>
        </div>

        <div className="status-usage">
          <div
            className={
              "status-usage__fill" +
              (isHighUsage ? " status-usage__fill--warning" : "")
            }
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
