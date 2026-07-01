import { useEffect, useRef, useState } from "react";

const EXPRESSIONS = [
  // idle pencil
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <g transform="rotate(-45 32 32)">
      <rect x="18" y="20" width="28" height="12" rx="2" fill="#FFD54F"/>
      <rect x="42" y="20" width="6" height="12" fill="#E57373"/>
      <polygon points="18,20 10,26 18,32" fill="#D7CCC8"/>
      <polygon points="10,26 6,26 10,24" fill="#212121"/>
    </g>
  </svg>`,

  // moving pencil
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <g transform="rotate(-35 32 32)">
      <rect x="18" y="20" width="28" height="12" rx="2" fill="#FFCA28"/>
      <rect x="42" y="20" width="6" height="12" fill="#EF5350"/>
      <polygon points="18,20 10,26 18,32" fill="#D7CCC8"/>
      <polygon points="10,26 6,26 10,24" fill="#212121"/>
      <line x1="50" y1="18" x2="58" y2="12" stroke="#999" stroke-width="2"/>
      <line x1="52" y1="24" x2="60" y2="18" stroke="#999" stroke-width="2"/>
    </g>
  </svg>`,

  // fast pencil
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <g transform="rotate(-25 32 32)">
      <rect x="18" y="20" width="28" height="12" rx="2" fill="#FFA000"/>
      <rect x="42" y="20" width="6" height="12" fill="#E53935"/>
      <polygon points="18,20 10,26 18,32" fill="#D7CCC8"/>
      <polygon points="10,26 6,26 10,24" fill="#212121"/>
      <line x1="50" y1="14" x2="62" y2="8" stroke="#666" stroke-width="2"/>
      <line x1="50" y1="20" x2="62" y2="16" stroke="#666" stroke-width="2"/>
      <line x1="50" y1="26" x2="62" y2="24" stroke="#666" stroke-width="2"/>
    </g>
  </svg>`,

  // idle/sleepy pencil
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <g transform="rotate(-45 32 32)" opacity="0.7">
      <rect x="18" y="20" width="28" height="12" rx="2" fill="#BDBDBD"/>
      <rect x="42" y="20" width="6" height="12" fill="#9E9E9E"/>
      <polygon points="18,20 10,26 18,32" fill="#D7CCC8"/>
      <polygon points="10,26 6,26 10,24" fill="#212121"/>
      <text x="48" y="12" font-size="8" fill="#888">z</text>
    </g>
  </svg>`,

  // click pencil
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <g transform="rotate(-45 32 32)">
      <rect x="18" y="20" width="28" height="12" rx="2" fill="#FFD54F"/>
      <rect x="42" y="20" width="6" height="12" fill="#E57373"/>
      <polygon points="18,20 10,26 18,32" fill="#D7CCC8"/>
      <polygon points="10,26 6,26 10,24" fill="#212121"/>
      <circle cx="54" cy="10" r="5" fill="#FF5252"/>
      <text x="52" y="13" font-size="6" fill="white">!</text>
    </g>
  </svg>`
];


export default function CatCursor() {
  const catRef = useRef(null);
  const lastPos = useRef({ x: -100, y: -100 });
  const speedRef = useRef(0);
  const frameRef = useRef(0);
  const animRef = useRef(null);
  const [expression, setExpression] = useState(0);

  useEffect(() => {
    const cat = catRef.current;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    // Smooth follow
    const animate = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      cat.style.left = `${currentX}px`;
      cat.style.top  = `${currentY}px`;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    // Mouse move
    const onMove = (e) => {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      speedRef.current = Math.sqrt(dx * dx + dy * dy);
      lastPos.current = { x: e.clientX, y: e.clientY };
      targetX = e.clientX;
      targetY = e.clientY;

      if (speedRef.current > 30) {
        setExpression(2); // excited
      } else if (speedRef.current > 10) {
        setExpression(1); // happy
      } else {
        setExpression(0); // idle
      }
    };

    // Click — surprised
    const onClick = () => {
      setExpression(4);
      setTimeout(() => setExpression(0), 600);
    };

    // Idle timer — sleepy after 3s no movement
    let idleTimer;
    const onMoveReset = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setExpression(3), 3000);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousemove", onMoveReset);
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", onMoveReset);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <div
        ref={catRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 99999,
          width: "40px",
          height: "40px",
          transform: "translate(-50%, -50%)",
          userSelect: "none",
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
        }}
        dangerouslySetInnerHTML={{ __html: EXPRESSIONS[expression] }}
      />
    </>
  );
}