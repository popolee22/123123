import React, { useState, useEffect } from 'react';
import { GeoCoordinates, LocationStatus, CheckInRecord, User, UserRole } from './types';
import { ALLOWED_RADIUS_METERS, STORAGE_KEY_FACTORY_LOC, STORAGE_KEY_HISTORY, STORAGE_KEY_USERS, STORAGE_KEY_CURRENT_USER, DEFAULT_FACTORY_LOCATION } from './constants';
import { calculateDistance, formatDate, formatTime } from './utils/geoUtils';
import { generateMotivationQuote } from './services/geminiService';

// --- Helper Components ---

const InstallGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tab, setTab] = useState<'ios' | 'android' | 'gps'>('ios');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-extrabold text-slate-800">APP 安装与使用教程</h3>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-2 mx-6 mt-4 bg-slate-100 rounded-xl flex p-1">
          <button 
            onClick={() => setTab('ios')} 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'ios' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            苹果 iOS
          </button>
          <button 
            onClick={() => setTab('android')} 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'android' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            安卓 Android
          </button>
          <button 
            onClick={() => setTab('gps')} 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'gps' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            无法定位?
          </button>
        </div>

        <div className="p-6 h-80 overflow-y-auto">
          {tab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                 <p className="text-xs text-blue-800 font-bold">⚠️ 重要提示：请确保您访问的是部署后的正式网址（非 blob: 开头的临时网址），否则无法安装。</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-700 text-sm mb-1">使用 Safari 打开链接</p>
                  <p className="text-xs text-slate-500">必须使用 iPhone 自带的 Safari 浏览器访问本页面。</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-700 text-sm mb-1">点击底部“分享”按钮</p>
                  <div className="mt-2 p-2 bg-slate-100 rounded-lg inline-block">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">就是那个带有向上箭头的方框图标。</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-700 text-sm mb-1">选择“添加到主屏幕”</p>
                  <p className="text-xs text-slate-500">在菜单中往下滑动找到该选项，然后点击右上角“添加”。</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'android' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
                 <p className="text-xs text-emerald-800 font-bold">⚠️ 关键步骤：请点击右上角 "Open in Chrome" 或 "在浏览器打开"。</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-700 text-sm mb-1">使用 Chrome 浏览器</p>
                  <p className="text-xs text-slate-500">推荐使用 Chrome 或 Edge 浏览器打开。</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-700 text-sm mb-1">点击右上角菜单</p>
                  <p className="text-xs text-slate-500">通常是三个小点点的图标。</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-700 text-sm mb-1">添加到主屏幕 / 安装应用</p>
                  <p className="text-xs text-slate-500">确认后，桌面会出现图标，像 App 一样使用。</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'gps' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 text-sm mb-2">⚠️ 必须允许定位权限</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  为了确保您真实在岗，本系统必须获取 GPS 定位。如果浏览器弹出请求，请务必选择 <span className="font-bold">“允许”</span>。
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                   <p className="font-bold text-slate-700 text-sm">如果是苹果手机：</p>
                   <p className="text-xs text-slate-500 mt-1">设置 {'>'} 隐私与安全性 {'>'} 定位服务 {'>'} Safari 网站 {'>'} 勾选“使用App期间”。</p>
                </div>
                <div>
                   <p className="font-bold text-slate-700 text-sm">如果是安卓手机：</p>
                   <p className="text-xs text-slate-500 mt-1">设置 {'>'} 应用程序管理 {'>'} Chrome {'>'} 权限 {'>'} 位置信息 {'>'} 允许。</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
           <button onClick={onClose} className="text-blue-600 font-bold text-sm">我学会了</button>
        </div>
      </div>
    </div>
  );
};

// --- Auth Components ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!name.trim() || !password.trim()) {
      setError('请输入姓名和密码');
      return;
    }

    const usersRaw = localStorage.getItem(STORAGE_KEY_USERS);
    const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (isRegistering) {
      if (users.find(u => u.name === name)) {
        setError('该姓名已被注册');
        return;
      }
      const newUser: User = { name, password, role };
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.name === name && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('姓名或密码错误');
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex flex-col justify-center px-6 relative">
      {showGuide && <InstallGuide onClose={() => setShowGuide(false)} />}

      {/* Help Button */}
      <button 
        onClick={() => setShowGuide(true)}
        className="absolute top-safe right-6 top-6 bg-white/80 backdrop-blur shadow-sm border border-slate-200 px-3 py-1.5 rounded-full flex items-center space-x-1 text-slate-600 text-xs font-bold hover:bg-white transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>安装/使用教程</span>
      </button>

      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-white">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 transform rotate-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
             </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isRegistering ? '创建账号' : '欢迎回来'}
          </h1>
          <p className="text-slate-500 text-base mt-3 font-medium">工厂考勤智能管理系统</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">姓名 (ID)</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入您的真实姓名"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="输入您的密码"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">选择身份</label>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setRole('employee')}
                  className={`flex-1 py-3 rounded-xl text-base font-bold border-2 transition-all ${role === 'employee' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                >
                  普通员工
                </button>
                <button 
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-3 rounded-xl text-base font-bold border-2 transition-all ${role === 'admin' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-100 text-slate-500 bg-slate-50'}`}
                >
                  老板/管理
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 text-sm font-medium py-3 px-4 rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 active:scale-[0.98] active:shadow-md transition-all mt-2"
          >
            {isRegistering ? '立即注册' : '登录系统'}
          </button>

          <div className="text-center mt-6">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-slate-500 font-medium text-base hover:text-blue-600 transition-colors"
            >
              {isRegistering ? '已有账号？去登录' : '新员工注册'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Feature Components ---

// 1. Live Clock Component
const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center text-white py-8">
      <div className="text-7xl font-bold tracking-tight tabular-nums drop-shadow-sm">
        {time.toLocaleTimeString('zh-CN', { hour12: false })}
      </div>
      <div className="text-blue-100 mt-2 text-lg font-medium tracking-wide opacity-90">
        {time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
      </div>
    </div>
  );
};

// 2. Radar/Location Visualizer
const LocationRadar: React.FC<{ status: LocationStatus; distance: number }> = ({ status, distance }) => {
  const isReady = status === LocationStatus.IN_RANGE;
  const colorClass = isReady ? 'border-emerald-500 bg-emerald-500' : 'border-amber-500 bg-amber-500';
  const textColor = isReady ? 'text-emerald-600' : 'text-amber-600';
  const bgColor = isReady ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200';
  
  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center mb-8 mt-4">
      {/* Ripple Effects */}
      <div className={`absolute inset-0 rounded-full border-2 ${colorClass} opacity-10 animate-[ping_3s_linear_infinite]`}></div>
      <div className={`absolute inset-8 rounded-full border-2 ${colorClass} opacity-20 animate-[ping_3s_linear_infinite_1s]`}></div>
      
      {/* Static Circles */}
      <div className={`absolute inset-4 rounded-full border ${colorClass} border-opacity-30`}></div>
      <div className={`absolute inset-16 rounded-full border ${colorClass} border-opacity-40`}></div>
      <div className={`absolute inset-28 rounded-full border ${colorClass} border-opacity-50`}></div>
      
      {/* Center Icon */}
      <div className="relative z-10 bg-white p-5 rounded-full shadow-xl shadow-slate-200">
        {status === LocationStatus.LOCATING ? (
           <svg className="w-10 h-10 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className={`w-10 h-10 ${isReady ? 'text-emerald-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>

      {/* Status Badge */}
      <div className={`absolute -bottom-6 px-5 py-2 rounded-full shadow-sm border font-bold text-sm flex items-center gap-2 ${bgColor} ${textColor}`}>
        {status === LocationStatus.LOCATING ? (
          <span>正在获取定位...</span>
        ) : (
          <>
            <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
            <span>距离工厂中心 {Math.round(distance)} 米</span>
          </>
        )}
      </div>
    </div>
  );
};

// 3. Check-in Button
const CheckInButton: React.FC<{ 
  status: LocationStatus; 
  onClick: () => void; 
  loading: boolean 
}> = ({ status, onClick, loading }) => {
  const isReady = status === LocationStatus.IN_RANGE;
  
  let buttonStyle = "bg-slate-200 text-slate-400 cursor-not-allowed"; 
  let ringStyle = "ring-slate-100";
  let text = "定位中...";
  let subtext = "请稍候";

  if (status === LocationStatus.IN_RANGE) {
    buttonStyle = "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-blue-300 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer";
    ringStyle = "ring-blue-100 animate-pulse";
    text = "上班打卡";
    subtext = formatTime(Date.now()).slice(0, 5);
  } else if (status === LocationStatus.OUT_OF_RANGE) {
    buttonStyle = "bg-gradient-to-b from-slate-300 to-slate-400 text-white shadow-slate-300 shadow-xl cursor-not-allowed";
    ringStyle = "ring-slate-100";
    text = "无法打卡";
    subtext = "不在范围内";
  }

  return (
    <div className={`relative rounded-full p-3 ring-4 ${ringStyle} transition-all duration-500`}>
      <button
        onClick={onClick}
        disabled={!isReady || loading}
        className={`
          w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 border-4 border-white/20
          ${buttonStyle}
        `}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium opacity-90">提交中...</span>
          </div>
        ) : (
          <>
            <span className="text-2xl font-bold tracking-wider drop-shadow-md">{text}</span>
            <span className="text-sm opacity-80 mt-1 font-medium tracking-wide bg-white/20 px-3 py-0.5 rounded-full">
               {subtext}
            </span>
          </>
        )}
      </button>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'dashboard' | 'settings'>('home');
  
  const [currentCoords, setCurrentCoords] = useState<GeoCoordinates | null>(null);
  const [factoryCoords, setFactoryCoords] = useState<GeoCoordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>(LocationStatus.LOCATING);
  const [distance, setDistance] = useState<number>(0);
  
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuote, setLastQuote] = useState<string | null>(null);

  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  
  const [isInIframe, setIsInIframe] = useState(false);
  const [isBlobUrl, setIsBlobUrl] = useState(false);

  useEffect(() => {
    // Check if running in iframe (preview mode)
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);
    
    // Check if running on a blob URL (typical for some preview environments)
    const isBlob = window.location.protocol === 'blob:';
    setIsBlobUrl(isBlob);

    const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedFactory = localStorage.getItem(STORAGE_KEY_FACTORY_LOC);
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

    if (savedFactory) {
      const coords = JSON.parse(savedFactory);
      setFactoryCoords(coords);
      setManualLat(coords.latitude.toString());
      setManualLng(coords.longitude.toString());
    } else {
      setFactoryCoords(DEFAULT_FACTORY_LOCATION);
      setManualLat(DEFAULT_FACTORY_LOCATION.latitude.toString());
      setManualLng(DEFAULT_FACTORY_LOCATION.longitude.toString());
    }

    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus(LocationStatus.ERROR);
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCurrentCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => setStatus(LocationStatus.ERROR),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (currentCoords && factoryCoords) {
      const dist = calculateDistance(currentCoords, factoryCoords);
      setDistance(dist);
      setStatus(dist <= ALLOWED_RADIUS_METERS ? LocationStatus.IN_RANGE : LocationStatus.OUT_OF_RANGE);
    } else if (!currentCoords) {
      setStatus(LocationStatus.LOCATING);
    }
  }, [currentCoords, factoryCoords]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(u));
    setActiveTab(u.role === 'admin' ? 'dashboard' : 'home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  const handleCheckIn = async () => {
    if (!currentCoords || status !== LocationStatus.IN_RANGE || !user) return;
    setIsLoading(true);
    
    await new Promise(r => setTimeout(r, 800));

    let quote = "打卡成功！";
    if (process.env.API_KEY) quote = await generateMotivationQuote();
    
    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      userName: user.name,
      timestamp: Date.now(),
      location: currentCoords,
      aiMessage: quote
    };
    
    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
    setLastQuote(quote);
    setIsLoading(false);
  };

  const saveFactorySettings = (coords: GeoCoordinates) => {
    setFactoryCoords(coords);
    localStorage.setItem(STORAGE_KEY_FACTORY_LOC, JSON.stringify(coords));
    setManualLat(coords.latitude.toString());
    setManualLng(coords.longitude.toString());
    alert("工厂位置已更新");
  };

  // Helper to open new window
  const openFullWindow = () => {
    // Don't open if it is a blob url, it will 404
    if (isBlobUrl) return;
    window.open(window.location.href, '_blank');
  };

  if (!user) {
    return (
      <>
        {isInIframe && (
          <div 
             onClick={isBlobUrl ? undefined : openFullWindow}
             className={`px-4 py-3 text-center text-sm font-bold sticky top-0 z-[100] border-b flex items-center justify-center shadow-sm ${isBlobUrl ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-900 border-amber-200 cursor-pointer'}`}
          >
             <span className="mr-2">⚠️</span> 
             {isBlobUrl ? (
               "预览模式(Blob)无法安装。请先部署代码到 Vercel 等平台。"
             ) : (
               <>
                 为了正常添加到桌面，请点击此处【在新窗口打开】
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                 </svg>
               </>
             )}
          </div>
        )}
        <AuthScreen onLogin={handleLogin} />
      </>
    );
  }

  const renderHome = () => (
    <div className="flex flex-col h-full bg-slate-50">
      {isInIframe && (
        <div 
          onClick={isBlobUrl ? undefined : openFullWindow}
          className={`px-4 py-2 text-center text-xs font-bold relative z-50 border-b ${isBlobUrl ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-900 border-amber-200 cursor-pointer'}`}
        >
           {isBlobUrl ? "临时预览链接，请先部署后使用" : "点击此处全屏打开 (推荐)"}
        </div>
      )}
      <div className="bg-blue-600 rounded-b-[3rem] shadow-xl shadow-blue-900/10 pb-10 pt-safe px-6 relative overflow-hidden z-0">
         {/* Decorate Pattern */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
         </div>

         {/* Header */}
         <div className="relative z-10 flex justify-between items-center mb-4 pt-2">
            <div className="flex items-center space-x-3 bg-blue-800/30 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                  {user.name.charAt(0)}
               </div>
               <div>
                 <div className="text-white font-bold text-base leading-tight">{user.name}</div>
                 <div className="text-blue-200 text-xs font-medium">{user.role === 'admin' ? '管理员' : '员工'}</div>
               </div>
            </div>
            <button onClick={handleLogout} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-medium text-white border border-white/20 backdrop-blur-md active:bg-white/20 transition-colors">
              退出
            </button>
         </div>

         <LiveClock />
      </div>

      <div className="flex-1 flex flex-col items-center -mt-10 z-10 px-4 pb-20 overflow-y-auto">
         <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-sm p-6 flex flex-col items-center border border-slate-50">
            
            <LocationRadar status={status} distance={distance} />
            
            <CheckInButton 
              status={status} 
              onClick={handleCheckIn} 
              loading={isLoading} 
            />

            <div className="mt-8 text-center w-full">
              <div className="flex items-center justify-center text-slate-400 text-sm font-medium space-x-1 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 <span>{currentCoords ? `当前: ${currentCoords.latitude.toFixed(4)}, ${currentCoords.longitude.toFixed(4)}` : '获取中...'}</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">考勤范围: {ALLOWED_RADIUS_METERS} 米内</p>
            </div>
         </div>

         {lastQuote && (
           <div className="mt-6 w-full max-w-sm bg-emerald-50 border border-emerald-100 p-5 rounded-2xl animate-[bounce-in_0.5s_ease-out] shadow-lg shadow-emerald-100">
              <p className="text-emerald-800 text-center font-bold text-base leading-relaxed">"{lastQuote}"</p>
           </div>
         )}
      </div>
    </div>
  );

  const renderHistory = () => {
    const myRecords = history.filter(r => r.userName === user.name);

    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white shadow-sm pt-safe px-6 py-4 sticky top-0 z-20 border-b border-slate-100">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">我的考勤</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">累计打卡 <span className="text-blue-600 font-bold">{myRecords.length}</span> 次</p>
            </div>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-slate-600 font-medium px-3 py-1 bg-slate-100 rounded-lg">退出登录</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
          {myRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="font-medium">暂无打卡记录</p>
            </div>
          ) : (
            myRecords.map((record) => (
              <div key={record.id} className="bg-white p-5 rounded-[1.25rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm">
                        ME
                    </div>
                    <div>
                        <div className="font-extrabold text-slate-800 text-xl tabular-nums">{formatTime(record.timestamp)}</div>
                        <div className="text-sm text-slate-500 font-medium mt-0.5">{formatDate(record.timestamp)}</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    <span className="text-emerald-700 font-bold text-sm">已到岗</span>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const todayStr = new Date().toLocaleDateString('zh-CN');
    const todayRecords = history.filter(r => 
      new Date(r.timestamp).toLocaleDateString('zh-CN') === todayStr
    );

    const userStatusMap = new Map<string, CheckInRecord>();
    todayRecords.forEach(r => {
      if (!userStatusMap.has(r.userName)) {
        userStatusMap.set(r.userName, r);
      }
    });

    const presentUsers = Array.from(userStatusMap.values());

    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-slate-800 text-white px-6 py-10 pt-safe rounded-b-[2.5rem] shadow-2xl shadow-slate-900/20">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-3xl font-extrabold tracking-tight">管理后台</h2>
             <button onClick={handleLogout} className="text-xs font-bold bg-slate-700 px-4 py-2 rounded-xl hover:bg-slate-600 transition-colors">退出</button>
           </div>
           <div className="flex space-x-4">
             <div className="flex-1 bg-slate-700/50 p-4 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">今日已到</div>
                <div className="text-3xl font-black text-emerald-400">{presentUsers.length} <span className="text-base font-medium text-slate-400">人</span></div>
             </div>
             <div className="flex-1 bg-slate-700/50 p-4 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">系统状态</div>
                <div className="text-xl font-bold text-blue-400 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                  正常运行
                </div>
             </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-24">
          <h3 className="font-bold text-slate-600 mb-4 px-1 text-lg">今日出勤名单 <span className="text-slate-400 font-normal text-sm ml-2">{todayStr}</span></h3>
          
          {presentUsers.length === 0 ? (
             <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-medium text-lg">今天还没有人打卡</p>
             </div>
          ) : (
            <div className="space-y-4">
              {presentUsers.map(record => (
                <div key={record.id} className="bg-white p-5 rounded-[1.25rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex justify-between items-center transform transition-all hover:scale-[1.02]">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-emerald-200 shadow-lg">
                        {record.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-lg">{record.userName}</div>
                        <div className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md mt-1 font-bold inline-block">已在工厂</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="font-mono font-bold text-slate-700 text-lg">{formatTime(record.timestamp)}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">打卡时间</div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white shadow-sm px-6 py-4 pt-safe sticky top-0 z-20 border-b border-slate-100">
         <h2 className="font-extrabold text-2xl text-slate-800">考勤点设置</h2>
         <p className="text-sm text-slate-400 font-medium mt-1">仅管理员可见</p>
       </div>
       <div className="p-6 space-y-6 overflow-y-auto pb-24">
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-start space-x-4 mb-6">
               <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-lg text-slate-800">快速设置</h3>
                 <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">请站在工厂中心位置，点击下方按钮即可更新考勤点。</p>
               </div>
            </div>
            <button 
              onClick={() => currentCoords && saveFactorySettings(currentCoords)}
              disabled={!currentCoords}
              className="w-full py-4 bg-blue-600 active:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {currentCoords ? "设当前位置为考勤点" : "正在定位..."}
            </button>
         </div>

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-5">手动输入坐标</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-2 font-bold ml-1">纬度 (Latitude)</label>
                <input type="text" value={manualLat} onChange={(e) => setManualLat(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-mono text-base text-slate-900 outline-none focus:border-blue-500 transition-colors"/>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-2 font-bold ml-1">经度 (Longitude)</label>
                <input type="text" value={manualLng} onChange={(e) => setManualLng(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-mono text-base text-slate-900 outline-none focus:border-blue-500 transition-colors"/>
              </div>
              <button onClick={() => {
                   const lat = parseFloat(manualLat);
                   const lng = parseFloat(manualLng);
                   if (!isNaN(lat) && !isNaN(lng)) saveFactorySettings({latitude: lat, longitude: lng});
                 }} className="w-full py-4 bg-slate-100 text-slate-600 font-bold text-lg rounded-2xl hover:bg-slate-200 transition-colors mt-2">
                保存坐标
              </button>
            </div>
         </div>
       </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col shadow-2xl overflow-hidden relative">
      <div className="flex-1 overflow-hidden relative z-0">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      <div className="bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe pt-2 px-6 absolute bottom-0 w-full z-50">
        <div className="flex justify-around items-center h-20">
           {/* Tab: Check In (Everyone) */}
           <button 
             onClick={() => setActiveTab('home')}
             className={`flex flex-col items-center space-y-1.5 w-20 transition-all ${activeTab === 'home' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <div className={`p-1 rounded-xl ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={activeTab === 'home' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <span className="text-[11px] font-bold">打卡</span>
           </button>

           {/* Tab: History (Employee) OR Dashboard (Boss) */}
           {user.role === 'admin' ? (
             <button 
               onClick={() => setActiveTab('dashboard')}
               className={`flex flex-col items-center space-y-1.5 w-20 transition-all ${activeTab === 'dashboard' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <div className={`p-1 rounded-xl ${activeTab === 'dashboard' ? 'bg-blue-50' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={activeTab === 'dashboard' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               </div>
               <span className="text-[11px] font-bold">后台</span>
             </button>
           ) : (
             <button 
               onClick={() => setActiveTab('history')}
               className={`flex flex-col items-center space-y-1.5 w-20 transition-all ${activeTab === 'history' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <div className={`p-1 rounded-xl ${activeTab === 'history' ? 'bg-blue-50' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={activeTab === 'history' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
               </div>
               <span className="text-[11px] font-bold">记录</span>
             </button>
           )}

           {/* Tab: Settings (Boss Only) */}
           {user.role === 'admin' && (
             <button 
               onClick={() => setActiveTab('settings')}
               className={`flex flex-col items-center space-y-1.5 w-20 transition-all ${activeTab === 'settings' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <div className={`p-1 rounded-xl ${activeTab === 'settings' ? 'bg-blue-50' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={activeTab === 'settings' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </div>
               <span className="text-[11px] font-bold">设置</span>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default App;