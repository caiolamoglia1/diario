import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useTheme } from './lib/theme';
import ClickSpark from './components/reactbits/ClickSpark/ClickSpark';
import Desk from './components/Desk';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import Diary from './components/Diary';

function Loading() {
  return <div className="loading-heart" aria-label="carregando">♥</div>;
}

export default function App() {
  // undefined = ainda carregando, null = não existe
  const theme = useTheme();
  const [session, setSession] = useState(undefined);
  const [profileState, setProfileState] = useState({ userId: null, data: undefined });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfileState({ userId, data: data ?? null });
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // perfil só vale para o usuário logado atual; senão ainda está carregando
  const profile = profileState.userId === userId ? profileState.data : undefined;

  let screen;
  if (session === undefined) screen = <Loading />;
  else if (!session) screen = <Login />;
  else if (profile === undefined) screen = <Loading />;
  else if (!profile) screen = <ProfileSetup userId={userId} onDone={loadProfile} />;
  else screen = <Diary me={profile} onProfileChange={loadProfile} />;

  return (
    <ClickSpark
      sparkColor={theme === 'moor' ? ['#e2c98e', '#bcd0ea', '#f4ecd8'] : ['#ffd27a', '#ff9fb8', '#fff3d6']}
      shape="star"
      sparkSize={11}
      sparkRadius={26}
      sparkCount={9}
      duration={550}
      glow={0.6}
      style={{ minHeight: '100svh' }}
    >
      <Desk>{screen}</Desk>
    </ClickSpark>
  );
}
