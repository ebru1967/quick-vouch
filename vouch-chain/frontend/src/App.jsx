import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import axios from 'axios';
import * as StellarSdk from 'stellar-sdk';
import './App.css'; // Tasarımı dahil ettik

// 1. Landing Sayfası
function Landing() {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (await isConnected()) {
      try {
        const response = await requestAccess();
        const address = response.address || response;
        setWalletAddress(address);
      } catch (e) {
        alert("Bağlantı hatası.");
      }
    } else {
      alert("Freighter yüklü değil!");
    }
  };

  return (
    <div className="container">
      <h1>⚡ Vouch-Chain</h1>
      <p style={{color: '#8b949e'}}>Blokzincir tabanlı güven protokolü.</p>
      
      {!walletAddress ? (
        <div className="card">
            <p>Devam etmek için cüzdanını bağla.</p>
            <button onClick={connectWallet}>Connect Freighter Wallet</button>
        </div>
      ) : (
        <div className="card">
            <p style={{ color: '#2ea043', fontWeight: 'bold' }}>✅ Cüzdan Bağlandı</p>
            <div className="address-box">{walletAddress}</div>
            <div style={{ marginTop: '20px' }}>
                <Link to={`/profile/${walletAddress}`}>
                  <button>Profilim & Skor</button>
                </Link>
                <Link to={`/vouch/${walletAddress}`}>
                  <button className="secondary">Kendime Vouch At (Test)</button>
                </Link>
            </div>
        </div>
      )}
    </div>
  );
}

// 2. Vouch Sayfası
function VouchPage() {
  const { stellarAddress } = useParams();
  const [status, setStatus] = useState("");

  const sendVouch = async () => {
    setStatus("⏳ Cüzdan onayı bekleniyor...");
    try {
        const response = await requestAccess();
        const userAddress = response.address || response;
        const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
        const account = await server.loadAccount(userAddress);

        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: "Test SDF Network ; September 2015",
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: stellarAddress,
            asset: StellarSdk.Asset.native(),
            amount: "1", 
        }))
        .addMemo(StellarSdk.Memo.text("VOUCH")) 
        .setTimeout(30)
        .build();

        const signedResponse = await signTransaction(transaction.toXDR(), { 
            network: "TESTNET",
            networkPassphrase: "Test SDF Network ; September 2015"
        });

        const finalXdr = (typeof signedResponse === 'object' && signedResponse.signedTxXdr) 
            ? signedResponse.signedTxXdr 
            : signedResponse;

        if (finalXdr) {
            setStatus("🚀 Blokzincire yazılıyor...");
            const tx = StellarSdk.TransactionBuilder.fromXDR(finalXdr, "Test SDF Network ; September 2015");
            await server.submitTransaction(tx);
            setStatus("✅ Başarılı! Güven puanı eklendi.");
            setTimeout(() => window.location.href = `/profile/${stellarAddress}`, 2000);
        }
    } catch (error) {
        setStatus("❌ Hata: " + error.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>🤝 Vouch Gönder</h2>
        <p>Şu hesaba kefil oluyorsunuz:</p>
        <div className="address-box">{stellarAddress}</div>
        
        <p style={{fontSize: '0.9rem', color: '#8b949e'}}>İşlem Ücreti: 1 XLM</p>
        
        <button onClick={sendVouch}>GIVE VOUCH (ONAYLA)</button>
        <br/>
        <Link to="/"><button className="secondary" style={{marginTop: '10px'}}>İptal</button></Link>
        
        <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#58a6ff' }}>{status}</p>
      </div>
    </div>
  );
}

// 3. Profil Sayfası
function ProfilePage() {
  const { stellarAddress } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5001/api/vouches/${stellarAddress}`)
        .then(res => setData(res.data))
        .catch(err => console.error(err));
  }, [stellarAddress]);

  return (
    <div className="container">
      <div className="card">
          <h2>👤 Kullanıcı Profili</h2>
          <div className="score-circle">
            {data ? data.vouchCount : 0}
          </div>
          <p style={{ marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: '#8b949e' }}>Trust Score</p>
          <div className="address-box" style={{fontSize: '0.8rem'}}>{stellarAddress}</div>
      </div>

      <h3 style={{marginTop: '30px', textAlign: 'left'}}>Son Aktiviteler</h3>
      {data && data.recentVouches.length > 0 ? (
        <ul>
            {data.recentVouches.map((v, i) => (
                <li key={i}>
                    <div>
                        <span style={{color: '#58a6ff'}}>Vouch Alındı</span>
                        <div style={{fontSize: '0.8rem', color: '#8b949e'}}>{v.source.substring(0,8)}...</div>
                    </div>
                    <small style={{ color: '#238636' }}>+1 Puan</small>
                </li>
            ))}
        </ul>
      ) : (
        <p style={{color: '#8b949e'}}>Henüz işlem yok.</p>
      )}
      
      <Link to="/"><button className="secondary" style={{marginTop: '20px'}}>Ana Sayfaya Dön</button></Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/vouch/:stellarAddress" element={<VouchPage />} />
        <Route path="/profile/:stellarAddress" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}