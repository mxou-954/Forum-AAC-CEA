import React, { useState, useEffect } from 'react';

const sampleCodes = [
  'console.log("Hello World!");',
  'if (isCoding) return "fun";',
  'let result = sum(a, b);',
  'function sum(a, b) { return a + b; }',
  'const react = { useState, useEffect };',
  'document.getElementById("demo").innerHTML = "Hello JavaScript!";',
  'fetch("/api/data").then(response => response.json());',
  'ReactDOM.render(<App />, document.getElementById("root"));',
  '// This is a comment',
  'for (let i = 0; i < items.length; i++) { console.log(items[i]); }'
];

const ConstructionPage = () => {
  const [clickCount, setClickCount] = useState(0);
  const [dot, setDot] = useState({ visible: false, top: 0, left: 0, code: '' });
  const [codeBuilt, setCodeBuilt] = useState([]);

  useEffect(() => {
    document.title = "Page En Construction";
    
    const interval = setInterval(() => {
      const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
      setDot({
        visible: true,
        top: Math.random() * (window.innerHeight - 50),
        left: Math.random() * (window.innerWidth - 50),
        code: randomCode
      });

      setTimeout(() => {
        setDot({...dot, visible: false});
      }, 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, [dot]);

  const handleDotClick = (e) => {
    e.stopPropagation();
    setClickCount(clickCount + 1);
    setCodeBuilt([...codeBuilt, dot.code]);
    setDot({...dot, visible: false});
  };
  return (
    <div style={styles.container}>
    <h1 style={styles.header}>🚧 Oops! En plein travaux... 🚧</h1><br /><br />
    <p>Le saviez vous ? Les développeurs aiment résoudre des problèmes. Si aucun n'existe, ils en créeront un.</p>
    <p style={styles.text}>
      Cliquez sur les ronds pour contribuer au code du site !
    </p>
    <p style={styles.clickCount}>Lignes de code ajoutées : {clickCount}</p>
    <div style={styles.codeContainer}>
      {codeBuilt.map((code, index) => (
        <code key={index} style={styles.codeLine}>{code}</code>
      ))}
    </div>
    {dot.visible && (
      <div 
        onClick={handleDotClick} 
        style={{
          ...styles.dot,
          top: dot.top,
          left: dot.left
        }}
      >
        <p style={styles.dotText}>{dot.code}</p>
      </div>
    )}
  </div>
);
};

const styles = {
  container: {
    position: 'relative',
    textAlign: 'center',
    padding: '50px',
    height: '100%',
    backgroundColor: '#121212',
    color: '#fff',
    fontFamily: '"Lucida Console", Monaco, monospace',
  },
  header: {
    color: '#FFD700',
  },
  text: {
    color: '#BBB',
    margin: '20px 0',
  },
  dot: {
    position: 'absolute',
    width: '50px',
    height: '50px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  clickCount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  }
};

export default ConstructionPage;