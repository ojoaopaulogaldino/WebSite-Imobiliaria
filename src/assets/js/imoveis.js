/**
 * Gerenciamento da página de imóveis e funcionalidade de filtragem
 */
import { API_BASE_URL } from './config/auth.js';

// Variáveis globais
let currentPage = 1;
let totalPages = 1;
let propertiesData = [];

// Elementos do DOM
const propertyFilterForm = document.getElementById('property-filter');
const propertiesGrid = document.getElementById('properties-grid');
const resultsTitle = document.getElementById('results-title');
const resultsCount = document.getElementById('results-count');
const citySelect = document.getElementById('filter-city');
const paginationContainer = document.getElementById('pagination');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Obter parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    
    // Carregar cidades
    loadCities();
    
    // Preencher o formulário com os parâmetros da URL
    for (const [key, value] of urlParams.entries()) {
        // Tratamento especial para city_id
        if (key === 'city_id') {
            if (citySelect) citySelect.value = value;
            continue;
        }
        
        // Para os demais campos, tentar encontrar pelo id
        const inputField = document.getElementById(`filter-${key.replace('_', '-')}`);
        if (inputField) {
            inputField.value = value;
        }
    }
    
    // Adicionar evento ao formulário
    if (propertyFilterForm) {
        propertyFilterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            currentPage = 1; // Resetar para a primeira página ao aplicar novos filtros
            applyFilters();
        });
    }
    
    // Carregar imóveis com os filtros da URL
    loadProperties();
});

/**
 * Carrega as cidades para o filtro
 */
async function loadCities() {
    if (!citySelect) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/cities`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar cidades: ${response.status}`);
        }
        
        const cities = await response.json();
        
        // Limpar opções existentes, exceto a primeira
        while (citySelect.options.length > 1) {
            citySelect.remove(1);
        }
        
        // Adicionar as cidades
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
        
        // Se tiver city_id na URL, selecionar
        const urlParams = new URLSearchParams(window.location.search);
        const cityId = urlParams.get('city_id');
        if (cityId) {
            citySelect.value = cityId;
        }
        
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
    }
}

/**
 * Aplica os filtros ao formulário e atualiza a URL
 */
function applyFilters() {
    if (!propertyFilterForm) return;
    
    const formData = new FormData(propertyFilterForm);
    const params = new URLSearchParams();
    
    // Adicionar apenas os campos preenchidos
    for (const [key, value] of formData.entries()) {
        if (value) {
            // Converter 'city' do formulário para 'city_id' na URL
            if (key === 'city') {
                params.append('city_id', value);
            } else {
                // Trocar hífens por underscores para a URL
                const paramKey = key.replace('-', '_');
                params.append(paramKey, value);
            }
        }
    }
    
    // Atualizar a URL sem recarregar a página
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.pushState({}, '', newUrl);
    
    // Recarregar os imóveis com os novos filtros
    loadProperties();
}

/**
 * Carrega os imóveis da API com os filtros aplicados
 */
async function loadProperties() {
    if (!propertiesGrid || !resultsCount) return;
    
    try {
        // Exibir loading
        propertiesGrid.innerHTML = '<div class="text-center w-full col-span-3 py-12">Carregando imóveis...</div>';
        resultsCount.textContent = 'Carregando...';
        
        // Obter parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        
        // Construir a URL da API com os parâmetros atuais
        let apiUrl = `${API_BASE_URL}/properties?`;
        
        // Adicionar os parâmetros da URL atual
        for (const [key, value] of urlParams.entries()) {
            // Converter city_id para city para a API
            if (key === 'city_id') {
                apiUrl += `city=${value}&`;
            } else if (key !== 'page') { // Ignorar o parâmetro page
                apiUrl += `${key}=${value}&`;
            }
        }
        
        // Adicionar paginação
        apiUrl += `page=${currentPage}`;
        
        // Fetch dos imóveis
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar imóveis: ${response.status}`);
        }
        
        const properties = await response.json();
        
        // Armazenar os dados para uso posterior
        propertiesData = properties;
        
        // Atualizar o contador
        resultsCount.textContent = `${properties.length} imóveis encontrados`;
        
        // Se não tiver imóveis
        if (properties.length === 0) {
            propertiesGrid.innerHTML = `
                <div class="text-center w-full col-span-3 py-12">
                    <p class="text-xl mb-4">Nenhum imóvel encontrado com os filtros atuais.</p>
                    <button class="p-3 bg-[#142a3d] text-white font-medium rounded-lg hover:bg-[#184a97] transition-colors"
                        onclick="window.location.href='imoveis.html'">
                        Limpar Filtros
                    </button>
                </div>
            `;
            return;
        }
        
        // Limpar e renderizar os imóveis
        propertiesGrid.innerHTML = '';
        
        properties.forEach(property => {
            const propertyCard = createPropertyCard(property);
            propertiesGrid.appendChild(propertyCard);
        });
        
        // Atualizar a paginação
        updatePagination();
        
    } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        propertiesGrid.innerHTML = `
            <div class="text-center w-full col-span-3 py-12">
                <p class="text-xl text-red-600">Erro ao carregar imóveis. Por favor, tente novamente.</p>
                <p class="text-gray-600 mt-2">${error.message}</p>
            </div>
        `;
        resultsCount.textContent = 'Erro ao carregar';
    }
}

/**
 * Cria o elemento de card para um imóvel
 */
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105';
    
    // Definir a URL da imagem (usar a principal ou uma padrão)
    const imageUrl = property.main_image_url || 'assets/images/thumbnails/thumbnails-1.png';
    
    // Formatar o preço
    const price = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(property.price);
    
    // Definir o tipo de transação
    let transactionType;
    switch (property.type) {
        case 'venda':
            transactionType = 'Venda';
            break;
        case 'aluguel':
            transactionType = 'Aluguel';
            break;
        case 'lancamento':
            transactionType = 'Lançamento';
            break;
        default:
            transactionType = property.type;
    }
    
    // Criar o HTML do card
    card.innerHTML = `
        <a href="imovel-detalhes.html?id=${property.id}" class="block">
            <div class="relative">
                <img src="${imageUrl}" alt="${property.title}" class="w-full h-52 object-cover">
                <div class="absolute top-0 right-0 bg-[#142a3d] text-white px-3 py-1 m-2 rounded">
                    ${transactionType}
                </div>
                <div class="absolute bottom-0 left-0 bg-[rgba(0,0,0,0.7)] text-white px-3 py-1 m-2 rounded">
                    ${property.code}
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2 line-clamp-2">${property.title}</h3>
                <p class="text-gray-600 mb-2">${property.neighborhood}, ${property.city}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-xl text-[#142a3d]">${price}</span>
                </div>
                <div class="flex mt-4 space-x-4 text-gray-600">
                    ${property.bedrooms ? `<div><span class="mr-1">🛏️</span> ${property.bedrooms} quartos</div>` : ''}
                    ${property.bathrooms ? `<div><span class="mr-1">🚿</span> ${property.bathrooms} banheiros</div>` : ''}
                    ${property.area ? `<div><span class="mr-1">📏</span> ${property.area}m²</div>` : ''}
                </div>
            </div>
        </a>
    `;
    
    return card;
}

/**
 * Atualiza a paginação
 */
function updatePagination() {
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // Se tiver apenas uma página, não mostrar paginação
    if (totalPages <= 1) return;
    
    const paginationWrapper = document.createElement('div');
    paginationWrapper.className = 'flex space-x-2';
    
    // Botão anterior
    const prevButton = document.createElement('button');
    prevButton.className = `px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#142a3d] text-white hover:bg-[#184a97]'}`;
    prevButton.textContent = 'Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProperties();
        }
    });
    paginationWrapper.appendChild(prevButton);
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-4 py-2 rounded ${i === currentPage ? 'bg-[#142a3d] text-white' : 'bg-gray-200 hover:bg-gray-300'}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) {
                currentPage = i;
                loadProperties();
            }
        });
        paginationWrapper.appendChild(pageButton);
    }
    
    // Botão próximo
    const nextButton = document.createElement('button');
    nextButton.className = `px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#142a3d] text-white hover:bg-[#184a97]'}`;
    nextButton.textContent = 'Próximo';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadProperties();
        }
    });
    paginationWrapper.appendChild(nextButton);
    
    paginationContainer.appendChild(paginationWrapper);
}

// Exportar funções para uso externo
export {
    loadProperties,
    applyFilters,
    loadCities
}; 