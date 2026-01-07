// pages/login.js - 登入/註冊頁面
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../lib/store';

export default function Login() {
  const router = useRouter();
  const { user, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 如果已登入，導向首頁
  useEffect(() => {
    if (user) {
      const redirect = router.query.redirect || (user.role === 'admin' ? '/admin' : '/');
      router.push(redirect);
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const loggedUser = await login(email, password);
        // 根據角色導向
        if (loggedUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(router.query.redirect || '/');
        }
      } else {
        if (!name.trim()) {
          throw new Error('請輸入姓名');
        }
        await register(email, password, name);
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>{isLogin ? '登入' : '註冊'} | 公司名稱</title>
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
              {isLogin ? '🔐' : '📝'}
            </div>
            <h2 className="text-2xl font-bold">{isLogin ? '會員登入' : '註冊帳號'}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? '登入以查看訂單紀錄' : '建立帳號享受購物優惠'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block mb-1.5 font-semibold text-sm">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="您的姓名"
                  required={!isLogin}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition"
                />
              </div>
            )}
            
            <div>
              <label className="block mb-1.5 font-semibold text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition"
              />
            </div>
            
            <div>
              <label className="block mb-1.5 font-semibold text-sm">密碼</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="輸入密碼"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm text-center">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? '處理中...' : (isLogin ? '登入' : '註冊')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary hover:underline text-sm"
            >
              {isLogin ? '還沒有帳號？立即註冊' : '已有帳號？立即登入'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t text-center text-xs text-gray-400">
            管理員：admin@meatshop.com / admin123
          </div>
        </div>
      </div>
    </Layout>
  );
}
