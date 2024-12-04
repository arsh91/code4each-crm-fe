import { useRouter } from 'vue-router';
import { ref } from 'vue';
import WordpressService from '@/service/WordpressService';


export function useAuth() {
  const router = useRouter();

  const isAuthenticated = ref(!!localStorage.getItem('access_token'));

  const logout = async () => {
    try {
      await WordpressService.post('/logout');
    } catch (error) {
      // Handle logout error
    }

    localStorage.removeItem('access_token');
    isAuthenticated.value = false;
    router.push('/');
    // Redirect or perform necessary actions after logout
  };

  return { isAuthenticated, logout };
}