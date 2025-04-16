/**
 * Módulo de autenticação
 */

// import { API_BASE_URL } from '../config/auth.js';
import { showAlert } from './ui.js';

export const API_BASE_URL = '/api';
// Verificar se o usuário está autenticado
export function checkAuth() {
  const user = getLoggedUser();
  
  // Se não tiver usuário e não estiver na página de login, redirecionar para login
  if (!user && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// Obter usuário logado do localStorage
export function getLoggedUser() {
  const userData = localStorage.getItem('admin_user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Erro ao ler dados do usuário:', error);
    return null;
  }
}

// Salvar usuário no localStorage
export function saveUser(user) {
  localStorage.setItem('admin_user', JSON.stringify(user));
}

// Fazer logout
export function logout() {
  localStorage.removeItem('admin_user');
  window.location.href = 'login.html';
}

// Lidar com o login do usuário
export function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const username = form.querySelector('#username').value;
  const password = form.querySelector('#password').value;
  
  if (!username || !password) {
    showAlert('Preencha o nome de usuário e senha', 'error');
    return;
  }
  
  // Desabilitar o botão de login
  const loginButton = form.querySelector('button[type="submit"]');
  if (loginButton) {
    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';
  }
  
  // Fazer requisição para a API
  fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }
      return response.json();
    })
    .then(data => {
      // Salvar usuário e redirecionar
      saveUser(data.user);
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Erro ao fazer login:', error);
      showAlert('Nome de usuário ou senha incorretos', 'error');
      
      // Reabilitar o botão
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
      }
    });
}
