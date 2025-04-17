/**
 * Módulo para exibir localidades (cidades) no frontend e gerenciar os filtros de busca
 */

// Importa a URL base da API do arquivo de configuração
import { API_BASE_URL } from '../config/auth.js';

// API URLs
const API_CITIES = `${API_BASE_URL}/cities`;
const API_PROPERTIES = `${API_BASE_URL}/properties`;

/**
 * Inicializa o módulo de localidades para o frontend
 */
export function initializeLocalidadesFrontend() {
    // Carregar cidades para o slider da página inicial
    loadCitiesForSlider();
    
    // Inicializar o formulário de filtro, se existir
    initializeFilterForm();
}

/**
 * Carrega as cidades cadastradas no sistema para exibição no slider
 */
async function loadCitiesForSlider() {
    try {
        const citySliderWrapper = document.querySelector('.swiper-wrapper');
        
        // Se não encontrar o elemento, não continua
        if (!citySliderWrapper) return;
        
        // Mostra um indicador de carregamento
        citySliderWrapper.innerHTML = '<div class="swiper-slide !w-fit" style="width: 100%; text-align: center;"><p>Carregando cidades...</p></div>';
        
        // Carrega as cidades da API
        console.log('Carregando cidades da API:', API_CITIES);
        const response = await fetch(API_CITIES);
        
        // Verifica se a resposta é válida
        if (!response.ok) {
            throw new Error(`Erro ao carregar cidades: ${response.status}`);
        }
        
        const cities = await response.json();
        
        // Verifica se a resposta é um array
        if (!Array.isArray(cities)) {
            throw new Error('A resposta não é um array de cidades');
        }
        
        // Se não tiver cidades, exibe uma mensagem
        if (cities.length === 0) {
            citySliderWrapper.innerHTML = '<div class="swiper-slide !w-fit" style="width: 100%; text-align: center;"><p>Nenhuma cidade encontrada</p></div>';
            return;
        }
        
        // Limpa o conteúdo atual do slider
        citySliderWrapper.innerHTML = '';
        
        // Renderiza cada cidade no slider
        cities.forEach(city => {
            const slide = createCitySlide(city);
            citySliderWrapper.appendChild(slide);
        });
        
        // Reinicializa o swiper para reconhecer os novos slides
        if (window.swiper) {
            window.swiper.update();
        }
    } catch (error) {
        console.error('Erro ao carregar cidades para o slider:', error);
        
        // Exibe uma mensagem de erro no slider
        const citySliderWrapper = document.querySelector('.swiper-wrapper');
        if (citySliderWrapper) {
            citySliderWrapper.innerHTML = `
                <div class="swiper-slide !w-fit" style="width: 100%; text-align: center;">
                    <p>Não foi possível carregar as cidades. Por favor, tente novamente mais tarde.</p>
                    <p style="color: #666; font-size: 14px; margin-top: 10px;">Erro: ${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * Cria um slide para uma cidade
 * @param {Object} city - Objeto com dados da cidade
 */
function createCitySlide(city) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide !w-fit first-of-type:pl-[calc((100%-1130px-60px)/2)] last-of-type:pr-[calc((100%-1130px-60px)/2)]';
    
    // Formata a URL para a página de busca com o filtro de cidade
    const citySearchUrl = `venda.html?city_id=${city.id}`;
    
    // Define o contador de imóveis (poderia ser obtido da API em uma implementação real)
    const propertyCount = city.property_count || 0;
    
    // Define a imagem padrão caso a cidade não tenha imagem
    const imageUrl = city.image_url || 'assets/images/thumbnails/thumbnails-default.png';
    
    slide.innerHTML = `
        <a href="${citySearchUrl}" class="card">
            <div class="relative flex shrink-0 w-[230px] h-[300px] rounded-[20px] overflow-hidden">
                <div class="relative flex flex-col justify-end w-full h-full p-5 gap-[2px] bg-[linear-gradient(180deg,_rgba(0,0,0,0)_49.87%,_rgba(0,0,0,0.8)_100%)] z-10">
                    <h3 class="font-bold text-xl leading-[30px] text-white">${city.name}</h3>
                    <p class="text-white">${propertyCount} Imóveis</p>
                </div>
                <img src="${imageUrl}" class="absolute w-full h-full object-cover" alt="${city.name}">
            </div>
        </a>
    `;
    
    return slide;
}

/**
 * Inicializa o formulário de filtro na seção Fresh-Space
 */
function initializeFilterForm() {
    const freshSpaceSection = document.getElementById('Fresh-Space');
    
    // Se não encontrar a seção, não continua
    if (!freshSpaceSection) return;
    
    // Cria o formulário de filtro
    const filterForm = createFilterForm();
    
    // Insere o formulário no início da seção, logo após o título
    const sectionTitle = freshSpaceSection.querySelector('h2');
    if (sectionTitle) {
        sectionTitle.insertAdjacentElement('afterend', filterForm);
    } else {
        freshSpaceSection.prepend(filterForm);
    }
    
    // Adiciona o evento de submit ao formulário
    filterForm.addEventListener('submit', handleFilterSubmit);
}

/**
 * Cria o formulário de filtro de imóveis
 */
function createFilterForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'bg-white rounded-lg shadow-md p-6 mb-8';
    
    formContainer.innerHTML = `
        <form id="filter-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="flex flex-col">
                <label for="filter-type" class="mb-2 font-medium text-gray-700">Tipo</label>
                <select id="filter-type" name="type" class="p-3 border border-gray-300 rounded-lg">
                    <option value="">Todos os tipos</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="condominio">Condomínio</option>
                    <option value="comercial">Comercial</option>
                    <option value="terreno">Terreno</option>
                </select>
            </div>
            
            <div class="flex flex-col">
                <label for="filter-city" class="mb-2 font-medium text-gray-700">Cidade</label>
                <select id="filter-city" name="city" class="p-3 border border-gray-300 rounded-lg">
                    <option value="">Todas as cidades</option>
                    <!-- As opções de cidades serão adicionadas dinamicamente -->
                </select>
            </div>
            
            <div class="flex flex-col">
                <label for="filter-purpose" class="mb-2 font-medium text-gray-700">Finalidade</label>
                <select id="filter-purpose" name="purpose" class="p-3 border border-gray-300 rounded-lg">
                    <option value="">Todas as finalidades</option>
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                </select>
            </div>
            
            <div class="flex flex-col">
                <label for="filter-code" class="mb-2 font-medium text-gray-700">Código do Imóvel</label>
                <input type="text" id="filter-code" name="code" placeholder="Ex: RF001" class="p-3 border border-gray-300 rounded-lg">
            </div>
            
            <div class="flex items-end">
                <button type="submit" class="w-full p-3 bg-[#142a3d] text-white font-medium rounded-lg hover:bg-[#184a97] transition-colors">
                    Buscar Imóveis
                </button>
            </div>
        </form>
    `;
    
    // Após criar o formulário, carregar as cidades para o select
    loadCitiesForFilter(formContainer);
    
    return formContainer;
}

/**
 * Carrega as cidades para o filtro
 */
async function loadCitiesForFilter(formContainer) {
    try {
        const citySelect = formContainer.querySelector('#filter-city');
        if (!citySelect) return;
        
        // Obter a lista de cidades da API
        const response = await fetch(API_CITIES);
        if (!response.ok) {
            throw new Error(`Erro ao carregar cidades: ${response.status}`);
        }
        
        const cities = await response.json();
        
        // Adicionar as opções de cidades ao select
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cidades para o filtro:', error);
    }
}

/**
 * Manipula o envio do formulário de filtro
 */
function handleFilterSubmit(event) {
    event.preventDefault();
    
    // Obtém os valores dos campos
    const type = document.getElementById('filter-type').value;
    const city = document.getElementById('filter-city').value;
    const purpose = document.getElementById('filter-purpose').value;
    const code = document.getElementById('filter-code').value;
    
    // Adiciona os parâmetros de busca na URL
    const params = new URLSearchParams();
    
    if (type) params.append('type', type);
    if (city) params.append('city_id', city);
    if (code) params.append('code', code);
    if (purpose) params.append('purpose', purpose);
    
    // Redireciona sempre para imoveis.html com os filtros aplicados
    window.location.href = `imoveis.html${params.toString() ? '?' + params.toString() : ''}`;
} 