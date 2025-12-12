import { useEffect, useRef, useState } from "react";

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

function Home() {
  const particlesRef = useRef([]);
  const starsStateRef = useRef([]);
  const isMobile = useIsMobile();
  const particlesCount = isMobile ? 50 : 100;

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
  }, []);

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

        @media (max-width: 480px) {
          h1 {
            font-size: 1.6rem;
            line-height: 1.2;
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
          textAlign: "center",
          paddingLeft: "16px",
          paddingRight: "16px",
          fontFamily: "Arial, sans-serif",
          backgroundColor: "transparent",
          color: "#f5f5f5",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            backgroundColor: "#1f1f1f",
            padding: "32px 24px",
            borderRadius: "24px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            border: "1px solid #2c2c2c",
            maxWidth: "700px",
            width: "100%",
          }}
        >
          <h1>🚧 Em construção 🕹️</h1>

          <p
            style={{
              fontSize: "1.125rem",
              maxWidth: "600px",
              margin: "0 auto 32px auto",
              color: "#d0d0d0",
            }}
          >
            Uma plataforma para jogadores descobrirem novos games,
            compartilharem experiências épicas com a comunidade e evoluírem cada
            vez mais no universo dos jogos. Também é um espaço onde
            desenvolvedores podem dividir suas jornadas, trocar aprendizados e
            compartilhar suas experiências na criação de jogos.
          </p>

          <a
            href="https://github.com/Yunguer/learning-web"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              backgroundColor: "#2b2b2b",
              color: "#f5f5f5",
              padding: "12px 24px",
              borderRadius: "9999px",
              border: "1px solid #3a3a3a",
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.7)",
              cursor: "pointer",
              gap: "8px",
              transition: "background-color 0.2s, transform 0.1s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#363636";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#2b2b2b";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <img
              src="https://avatars.githubusercontent.com/u/74862406?v=4&size=64"
              alt="Avatar do autor"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
              }}
            />
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Ver projeto no GitHub
            </span>
          </a>
        </div>
      </div>
    </>
  );
}

export default Home;
