/**
 * Arquivo principal de JavaScript para integração com a API
 */

// URL base da API
const API_BASE_URL = '/api';

// Variável global para armazenar todas as propriedades da página atual
let currentProperties = [];

// Variáveis para controle de paginação
const ITEMS_PER_PAGE = 6; // Número de itens por página
let currentPage = 1; // Página atual

// Função para carregar imóveis em destaque na página inicial
async function loadFeaturedProperties() {
  try {
    const response = await fetch('/api/admin/properties');
    const properties = await response.json();

    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) return;

    // Limpa o conteúdo atual
    cardsGrid.innerHTML = '';

    // Filtra apenas os imóveis marcados como destaque (se necessário)
    // e limita a 6 imóveis
    const featuredProperties = properties.slice(0, 6);

    featuredProperties.forEach(property => {
      const card = document.createElement('div');
      card.className = 'card';
      
      // Formata o preço em reais
      const price = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(property.price || 0);

      // Verifica se as propriedades existem antes de acessá-las
      const images = property.images || [];
      const address = property.address || {};
      const propertyId = property.id || '';
      const propertyTitle = property.title || 'Imóvel sem título';
      const propertyType = property.type || 'venda';
      const propertyCode = property.code || 'Sem código';
      const propertyNeighborhood = property.neighborhood || 'Sem bairro';
      const propertyCity = property.city || 'Sem cidade';

      card.innerHTML = `
        <a href="details.html?id=${propertyId}" class="card">
            <div class="flex flex-col rounded-[20px] border border-[#E0DEF7] bg-white overflow-hidden h-full">
                <div class="thumbnail-container relative w-full h-[200px]">
                    <p class="btn-tag">
                        ${propertyType === 'aluguel' ? 'Aluguel' : 'Venda'}
                    </p>
                    <img src="${images[0] || 'assets/images/thumbnails/thumbnails-1.png'}" class="w-full h-full object-cover" alt="thumbnails">
                </div>
                <div class="card-detail-container flex flex-col p-5 pb-[30px] gap-4">
                    <h3 class="line-clamp-2 font-bold text-[22px] leading-[36px] h-[72px]">${propertyTitle}</h3>
                    <div class="flex items-center justify-between">
                        <p class="font-semibold text-xl leading-[30px]">${price}</p>
                        <div class="flex items-center justify-end gap-[6px]">
                            <p class="font-semibold">CÓD. ${propertyCode}</p>
                        </div>
                    </div>
                    <hr class="border-[#F6F5FD]">
                    <div class="flex items-center justify-start gap-[6px]">
                        <img src="assets/images/icons/location.svg" class="w-6 h-6 icon" alt="icon">
                        <p class="font-semibold">${propertyNeighborhood} - ${propertyCity}</p>
                    </div>
                </div>
            </div>
        </a>
      `;
      
      cardsGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao carregar imóveis:', error);
    const cardsGrid = document.querySelector('.cards-grid');
    if (cardsGrid) {
      cardsGrid.innerHTML = '<div class="text-center w-full col-span-3">Erro ao carregar imóveis. Por favor, tente novamente mais tarde.</div>';
    }
  }
}

// Função para carregar imóveis por tipo (venda, aluguel, lançamento)
async function loadPropertiesByType() {
  try {
    console.log('Iniciando carregamento de imóveis...'); // Debug

    const response = await fetch('/api/admin/properties');
    const properties = await response.json();

    console.log('Dados recebidos:', properties); // Debug

    // Encontra o grid em qualquer uma das páginas usando a classe específica
    const cardsGrid = document.querySelector('.properties-grid');
    if (!cardsGrid) {
      console.error('Grid não encontrado');
      return;
    }

    console.log('Grid encontrado:', cardsGrid); // Debug

    // Limpa o conteúdo atual
    cardsGrid.innerHTML = '';

    // Se não houver imóveis, mostra mensagem
    if (!properties || properties.length === 0) {
      cardsGrid.innerHTML = '<div class="text-center w-full col-span-3">Nenhum imóvel encontrado.</div>';
        return;
      }
      
    // Filtra os imóveis baseado na página atual
    let filteredProperties = properties;
    const currentPage = window.location.pathname;

    if (currentPage.includes('venda.html')) {
      filteredProperties = properties.filter(prop => prop.type === 'venda');
    } else if (currentPage.includes('aluguel.html')) {
      filteredProperties = properties.filter(prop => prop.type === 'aluguel');
    } else if (currentPage.includes('lancamentos.html')) {
      filteredProperties = properties.filter(prop => prop.type === 'lancamento');
    }

    console.log('Imóveis filtrados:', filteredProperties); // Debug

    if (filteredProperties.length === 0) {
      cardsGrid.innerHTML = '<div class="text-center w-full col-span-3">Nenhum imóvel encontrado para esta categoria.</div>';
      return;
    }

    filteredProperties.forEach(property => {
      // Formata o preço em reais
      let price = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
      }).format(property.price || 0);
        
      // Adiciona sufixos baseado no tipo
        if (property.type === 'aluguel') {
        price += '/mês';
        } else if (property.type === 'lancamento') {
        price = 'A partir de ' + price;
      }

      const typeText = {
        'aluguel': 'Aluguel',
        'venda': 'Venda',
        'lancamento': 'Lançamento'
      }[property.type] || 'Venda';

      const card = document.createElement('div');
      card.innerHTML = `
        <a href="details.html?id=${property.id || ''}" class="card">
          <div class="flex flex-col rounded-[20px] border border-[#E0DEF7] bg-white overflow-hidden h-full">
            <div class="thumbnail-container relative w-full h-[200px]">
              <p class="btn-tag">
                        ${typeText}
              </p>
                    <img src="${property.images?.[0] || 'assets/images/thumbnails/thumbnails-1.png'}" 
                         class="w-full h-full object-cover" 
                         alt="thumbnails">
            </div>
            <div class="card-detail-container flex flex-col p-5 pb-[30px] gap-4">
                    <h3 class="line-clamp-2 font-bold text-[22px] leading-[36px] h-[72px]">
                        ${property.title || 'Imóvel sem título'}
                    </h3>
              <div class="flex items-center justify-between">
                        <p class="font-semibold text-xl leading-[30px]">${price}</p>
                <div class="flex items-center justify-end gap-[6px]">
                            <p class="font-semibold">CÓD. ${property.code || 'Sem código'}</p>
                </div>
              </div>
              <hr class="border-[#F6F5FD]">
              <div class="flex items-center justify-start gap-[6px]">
                        <img src="assets/images/icons/location.svg" class="w-6 h-6 icon" alt="icon">
                        <p class="font-semibold">${property.neighborhood || 'Sem bairro'} - ${property.city || 'Sem cidade'}</p>
              </div>
            </div>
          </div>
        </a>
      `;
      
      cardsGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao carregar imóveis:', error);
    const cardsGrid = document.querySelector('.properties-grid');
    if (cardsGrid) {
      cardsGrid.innerHTML = '<div class="text-center w-full col-span-3">Erro ao carregar imóveis. Por favor, tente novamente mais tarde.</div>';
    }
  }
}

// Função para carregar detalhes de um imóvel específico
async function loadPropertyDetails() {
    try {
        // Verificar se estamos na página de detalhes
        if (!window.location.pathname.includes('details.html')) return;
        
        // Obter o ID do imóvel da URL
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');
        
        if (!propertyId) {
            console.error('ID do imóvel não encontrado na URL');
            window.location.href = 'index.html';
            return;
        }
        
        // Mostrar indicador de carregamento
        const detailsContainer = document.querySelector('.property-details-container');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<div class="text-center w-full py-8">Carregando detalhes do imóvel...</div>';
        }
        
        // Buscar todos os imóveis
        const response = await fetch('/api/admin/properties');
        if (!response.ok) {
            throw new Error('Erro ao buscar imóveis');
        }
        
        const properties = await response.json();
        
        // Encontrar o imóvel específico pelo ID
        const property = properties.find(p => {
            const pId = String(p.id || p._id);
            const searchId = String(propertyId);
            return pId === searchId;
        });
        
        if (!property) {
            throw new Error('Imóvel não encontrado');
        }

        // Obter o template
        const template = document.querySelector('#property-details-template');
        if (!template) {
            throw new Error('Template não encontrado');
        }
        
        // Clonar o template
        const content = template.content.cloneNode(true);
        
        // Preencher o template com os dados do imóvel
        updatePropertyDetailsUI(content, property);
        
        // Limpar o container e adicionar o conteúdo
        if (detailsContainer) {
            detailsContainer.innerHTML = '';
            detailsContainer.appendChild(content);
        } else {
            console.error('Container de detalhes não encontrado');
        }
        
        // Adicionar eventos para as miniaturas de imagens após adicionar o conteúdo ao DOM
        setTimeout(() => {
            const thumbnails = document.querySelectorAll('.property-thumbnails div img');
            const mainImage = document.querySelector('.property-main-image');
            
            if (thumbnails.length > 0 && mainImage) {
                thumbnails.forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        mainImage.src = thumb.src;
                    });
                });
            }
            
            // Adicionar evento para o formulário de contato
            const contactForm = document.querySelector('.property-details-container form');
            if (contactForm) {
                contactForm.addEventListener('submit', handleContactFormSubmit);
            }
        }, 100);

    } catch (error) {
        console.error('Erro ao carregar detalhes do imóvel:', error);
        const detailsContainer = document.querySelector('.property-details-container');
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="text-center w-full py-8">
                    <p class="text-xl font-bold text-red-600 mb-4">Erro ao carregar o imóvel</p>
                    <p>${error.message}</p>
                    <a href="index.html" class="bg-[#142a3d] text-white py-2 px-4 rounded-lg font-semibold inline-block mt-4">
                        Voltar para a página inicial
                    </a>
                </div>
            `;
        }
    }
}

// Função para atualizar a UI com os detalhes do imóvel
function updatePropertyDetailsUI(content, property) {
    // Atualizar título e tipo
    content.querySelector('.property-title').textContent = property.title || 'Sem título';
    content.querySelector('.property-type').textContent = formatPropertyType(property.type);
    
    // Atualizar preço
    const price = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(property.price || 0);
  
    let displayPrice = price;
    if (property.type === 'aluguel') {
        displayPrice += '/mês';
    } else if (property.type === 'lancamento') {
        displayPrice = 'A partir de ' + price;
    }
    content.querySelector('.property-price').textContent = displayPrice;
    
    // Atualizar código e localização
    content.querySelector('.property-code').textContent = `CÓD. ${property.code || 'N/A'}`;
    content.querySelector('.property-location').textContent = `${property.neighborhood || ''} - ${property.city || ''}`;
    
    // Atualizar descrição
    content.querySelector('.property-description').textContent = property.description || 'Sem descrição disponível';
    
    // Atualizar características
    content.querySelector('.property-bedrooms').textContent = property.bedrooms || '0';
    content.querySelector('.property-bathrooms').textContent = property.bathrooms || '0';
    content.querySelector('.property-parking').textContent = property.parkingSpots || '0';
    content.querySelector('.property-area').textContent = `${property.area || '0'} m²`;
    content.querySelector('.property-suites').textContent = property.suites || '0';
    content.querySelector('.property-furnished').textContent = property.furnished ? 'Sim' : 'Não';
    
    // Atualizar imagens
    const mainImage = content.querySelector('.property-main-image');
    const thumbnailsContainer = content.querySelector('.property-thumbnails');
    
    if (property.images && property.images.length > 0) {
        mainImage.src = property.images[0];
        mainImage.alt = property.title;
        
        // Limpar e adicionar thumbnails
        thumbnailsContainer.innerHTML = '';
        property.images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'w-full h-20 cursor-pointer';
            thumbnail.innerHTML = `
                <img src="${image}" alt="${property.title} - Imagem ${index + 1}" 
                     class="w-full h-full object-cover rounded-lg">
            `;
            thumbnail.addEventListener('click', () => {
                mainImage.src = image;
            });
            thumbnailsContainer.appendChild(thumbnail);
        });
    }
    
    // Atualizar comodidades
    const amenitiesContainer = content.querySelector('.property-amenities');
    if (amenitiesContainer && property.amenities && property.amenities.length > 0) {
        amenitiesContainer.innerHTML = '';
        property.amenities.forEach(amenity => {
            const amenityDiv = document.createElement('div');
            amenityDiv.className = 'flex items-center gap-2';
            amenityDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#142a3d]" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>${amenity}</span>
            `;
            amenitiesContainer.appendChild(amenityDiv);
        });
    }
    
    // Adicionar ID do imóvel ao formulário de contato
    const contactForm = content.querySelector('form');
    if (contactForm) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'property_id';
        hiddenInput.value = property._id;
        contactForm.appendChild(hiddenInput);
    }
}

// Função para lidar com o envio do formulário de contato
async function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const phone = form.querySelector('#phone').value;
    const message = form.querySelector('#message').value;
    const propertyId = form.querySelector('input[name="property_id"]')?.value;
    const propertyTitle = document.querySelector('.property-title')?.textContent || 'Imóvel';
    const propertyCode = document.querySelector('.property-code')?.textContent?.replace('CÓD. ', '') || '';
    const propertyType = document.querySelector('.property-type')?.textContent || '';
    const propertyPrice = document.querySelector('.property-price')?.textContent || '';
    
    // Validar campos obrigatórios
    if (!name || !email || !phone || !message) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Desabilitar o botão de envio e mostrar carregamento
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Enviando...';
    }
    
    try {
        // 1. Primeiro, salvar a mensagem no banco de dados
        const saveResponse = await fetch('/api/whatsapp-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                phone,
                message,
                property_id: propertyId,
                property_title: propertyTitle,
                property_code: propertyCode,
                property_type: propertyType,
                property_price: parseFloat(propertyPrice.replace(/[^\d,]/g, '').replace(',', '.')) || 0
            })
        });
        
        if (!saveResponse.ok) {
            throw new Error('Erro ao salvar a mensagem. Por favor, tente novamente.');
        }
        
        // 2. Buscar número de WhatsApp da imobiliária
        const settingsResponse = await fetch('/api/admin/settings');
        if (!settingsResponse.ok) {
            throw new Error('Erro ao obter configurações. Por favor, tente novamente mais tarde.');
        }
        
        const settings = await settingsResponse.json();
        let whatsappNumber = settings.whatsapp || '5511999999999';
        
        // Remover caracteres não numéricos
        whatsappNumber = whatsappNumber.replace(/\D/g, '');
        
        // Se o número não começar com 55 (Brasil), adicionar
        if (!whatsappNumber.startsWith('55')) {
            whatsappNumber = '55' + whatsappNumber;
        }
        
        // Criar texto da mensagem
        const whatsappText = encodeURIComponent(
            `Olá! Estou interessado no imóvel ${propertyCode} - ${propertyTitle}.\n\n` +
            `Nome: ${name}\n` +
            `Email: ${email}\n` +
            `Telefone: ${phone}\n\n` +
            `Mensagem: ${message}`
        );
        
        // Redirecionar para WhatsApp
        window.open(`https://wa.me/${whatsappNumber}?text=${whatsappText}`, '_blank');
        
        // Resetar o formulário
        form.reset();
        
        // Reabilitar o botão
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Chamar no WhatsApp';
        }

        // Exibir mensagem de sucesso
        alert('Mensagem enviada com sucesso! Você será redirecionado para o WhatsApp.');
    } catch (error) {
        console.error('Erro ao processar envio de mensagem:', error);
        alert(error.message);
        
        // Reabilitar o botão
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Chamar no WhatsApp';
        }
    }
}

// Função auxiliar para formatar o tipo de imóvel
function formatPropertyType(type) {
  const types = {
    'venda': 'Venda',
    'aluguel': 'Aluguel',
    'lancamento': 'Lançamento'
  };
  
  return types[type] || type;
}

// Função para carregar estatísticas de imóveis
function loadPropertyStats() {
  const statsSection = document.getElementById('property-stats');
  
  if (!statsSection) return;
  
  fetch(`${API_BASE_URL}/stats`)
    .then(response => response.json())
    .then(data => {
      // Atualizar contadores
      if (data.total_properties) {
        const totalCounter = document.getElementById('total-properties');
        if (totalCounter) totalCounter.textContent = data.total_properties;
      }
      
      if (data.total_sales) {
        const salesCounter = document.getElementById('total-sales');
        if (salesCounter) salesCounter.textContent = data.total_sales;
      }
      
      if (data.total_rentals) {
        const rentalsCounter = document.getElementById('total-rentals');
        if (rentalsCounter) rentalsCounter.textContent = data.total_rentals;
      }
      
      if (data.total_launches) {
        const launchesCounter = document.getElementById('total-launches');
        if (launchesCounter) launchesCounter.textContent = data.total_launches;
      }
    })
    .catch(error => {
      console.error('Erro ao carregar estatísticas:', error);
    });
}

// Função para carregar e exibir imóveis
async function loadProperties() {
    try {
        // Identifica a página atual e define o tipo de imóvel
        const currentPath = window.location.pathname;
        let propertyType = '';

        if (currentPath.includes('venda.html')) {
            propertyType = 'venda';
        } else if (currentPath.includes('aluguel.html')) {
            propertyType = 'aluguel';
        } else if (currentPath.includes('lancamentos.html')) {
            propertyType = 'lancamento';
        }

        // Se não estiver em nenhuma das páginas relevantes, não faz nada
        if (!propertyType) return;

        // Busca o elemento grid
        const grid = document.querySelector('.properties-grid');
        if (!grid) {
            console.error('Grid não encontrado');
            return;
        }

        // Mostra mensagem de carregamento
        grid.innerHTML = '<div class="text-center w-full col-span-3">Carregando imóveis...</div>';

        // Busca os dados da API
        const response = await fetch('/api/admin/properties');
        const properties = await response.json();

        // Filtra os imóveis pelo tipo
        currentProperties = properties.filter(property => property.type === propertyType);

        // Busca as imagens de cada imóvel em uma única requisição (com Promise.all)
        currentProperties = await Promise.all(
            currentProperties.map(async (property) => {
                try {
                    const imagesResponse = await fetch(`/api/properties/${property.id}`);
                    if (imagesResponse.ok) {
                        const propertyData = await imagesResponse.json();
                        // Adiciona as imagens ao objeto de propriedade
                        if (propertyData.images && propertyData.images.length > 0) {
                            property.images = propertyData.images;
                            property.imageUrl = propertyData.images[0].image_url;
                        }
                    }
                } catch (error) {
                    console.warn(`Erro ao buscar imagens do imóvel ${property.id}:`, error);
                }
                return property;
            })
        );

        // Reset para a primeira página quando carregar novas propriedades
        currentPage = 1;

        // Configura os eventos de filtro
        setupFilterEvents();

        // Exibe os imóveis (inicialmente sem filtros) com paginação
        displayProperties(currentProperties);
        
    } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        const grid = document.querySelector('.properties-grid');
        if (grid) {
            grid.innerHTML = '<div class="text-center w-full col-span-3">Erro ao carregar imóveis. Por favor, tente novamente mais tarde.</div>';
        }
    }
}

// Função para configurar eventos de filtro
function setupFilterEvents() {
    const filterForm = document.querySelector('form');
    if (!filterForm) {
        console.error('Formulário de filtro não encontrado');
        return;
    }

    console.log('Configurando eventos de filtro'); // Debug

    // Previne o envio padrão do formulário e aplica os filtros
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Formulário submetido - aplicando filtros'); // Debug
        applyFilters();
    });
}

// Função para aplicar os filtros
function applyFilters() {
    const location = document.querySelector('select[name="location"]')?.value;
    const propertyType = document.querySelector('select[name="propertyType"]')?.value;
    const priceRange = document.querySelector('select[name="priceRange"]')?.value;
    const bedrooms = document.querySelector('select[name="bedrooms"]')?.value;
    const area = document.querySelector('select[name="area"]')?.value;
    const propertyCode = document.querySelector('input[name="code"]')?.value;

    let filteredProperties = [...currentProperties];

    // Filtra por código do imóvel
    if (propertyCode && propertyCode.trim() !== '') {
        filteredProperties = filteredProperties.filter(property => 
            property.code?.toLowerCase().includes(propertyCode.toLowerCase())
        );
    }

    // Filtra por localização
    if (location) {
        filteredProperties = filteredProperties.filter(property => 
            property.neighborhood?.toLowerCase().includes(location.toLowerCase())
        );
    }

    // Filtra por tipo de imóvel
    if (propertyType) {
        filteredProperties = filteredProperties.filter(property => 
            property.property_type?.toLowerCase() === propertyType.toLowerCase()
        );
    }

    // Filtra por faixa de preço
    if (priceRange) {
        filteredProperties = filteredProperties.filter(property => {
            const price = property.price || 0;
            switch(priceRange) {
                case 'ate-500k':
                    return price <= 500000;
                case '500k-1m':
                    return price > 500000 && price <= 1000000;
                case '1m-2m':
                    return price > 1000000 && price <= 2000000;
                case 'acima-2m':
                    return price > 2000000;
                default:
                    return true;
            }
        });
    }

    // Filtra por número de dormitórios
    if (bedrooms) {
        filteredProperties = filteredProperties.filter(property => {
            const beds = property.bedrooms || 0;
            switch(bedrooms) {
                case '1-dorm':
                    return beds === 1;
                case '2-dorm':
                    return beds === 2;
                case '3-dorm':
                    return beds === 3;
                case '4+-dorm':
                    return beds >= 4;
                default:
                    return true;
            }
        });
    }

    // Filtra por área
    if (area) {
        filteredProperties = filteredProperties.filter(property => {
            const propertyArea = property.area || 0;
            switch(area) {
                case 'ate-50':
                    return propertyArea <= 50;
                case '50-100':
                    return propertyArea > 50 && propertyArea <= 100;
                case '100-200':
                    return propertyArea > 100 && propertyArea <= 200;
                case 'acima-200':
                    return propertyArea > 200;
                default:
                    return true;
            }
        });
    }

    // Reset para a primeira página quando filtrar
    currentPage = 1;
    
    // Exibe os imóveis filtrados
    displayProperties(filteredProperties);
}

// Função para exibir os imóveis no grid
function displayProperties(properties) {
    const grid = document.querySelector('.properties-grid');
    if (!grid) {
        console.error('Grid não encontrado ao tentar exibir propriedades');
        return;
    }

    // Se não encontrou imóveis, mostra mensagem
    if (!properties || properties.length === 0) {
        grid.innerHTML = '<div class="text-center w-full col-span-3">Nenhum imóvel encontrado com os filtros selecionados.</div>';
        // Ocultar a paginação
        const paginationContainer = document.querySelector('.flex.items-center.justify-center.gap-2.mt-\\[50px\\]');
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }
        return;
    }

    // Calcula os índices inicial e final para a página atual
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, properties.length);
    
    // Obtém apenas os imóveis da página atual
    const paginatedProperties = properties.slice(startIndex, endIndex);

    // Limpa o grid antes de adicionar novos cards
    grid.innerHTML = '';

    // Adiciona cada imóvel ao grid
    paginatedProperties.forEach(property => {
        // Pula imóveis sem ID válido
        const propertyId = property.id || property._id;
        if (!propertyId) {
            console.error('Imóvel sem ID:', property);
            return;
        }

        // Formata o preço
        const price = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(property.price || 0);

        // Define o texto do tipo e do preço
        let priceText = price;
        if (property.type === 'aluguel') {
            priceText += '/mês';
        } else if (property.type === 'lancamento') {
            priceText = 'A partir de ' + price;
        }

        // Determina a URL da imagem
        let imageUrl = 'assets/images/thumbnails/thumbnails-1.png'; // Imagem padrão
        if (property.imageUrl) {
            imageUrl = property.imageUrl;
        } else if (property.images && property.images.length > 0) {
            imageUrl = property.images[0].image_url || property.images[0].url || 'assets/images/thumbnails/thumbnails-1.png';
        }

        // Formata o texto do tipo de propriedade
        const typeText = formatPropertyType(property.type);

        // Cria o elemento do card
        const cardDiv = document.createElement('div');
        cardDiv.className = 'property-card cursor-pointer transition-transform duration-300 hover:scale-[1.02]';
        cardDiv.setAttribute('data-property-id', String(propertyId));
        cardDiv.innerHTML = `
            <a href="details.html?id=${String(propertyId)}" class="block">
                <div class="flex flex-col rounded-[20px] border border-[#E0DEF7] bg-white overflow-hidden h-full">
                    <div class="thumbnail-container relative w-full h-[200px]">
                        <p class="btn-tag">
                            ${typeText}
                        </p>
                        <img src="${imageUrl}" 
                             class="w-full h-full object-cover" 
                             alt="${property.title || 'Imóvel'}">
                    </div>
                    <div class="card-detail-container flex flex-col p-5 pb-[30px] gap-4">
                        <h3 class="line-clamp-2 font-bold text-[22px] leading-[36px] h-[72px]">
                            ${property.title || 'Imóvel sem título'}
                        </h3>
                        <div class="flex items-center justify-between">
                            <p class="font-semibold text-xl leading-[30px]">${priceText}</p>
                            <div class="flex items-center justify-end gap-[6px]">
                                <p class="font-semibold">CÓD. ${property.code || 'N/A'}</p>
                            </div>
                        </div>
                        <hr class="border-[#F6F5FD]">
                        <div class="flex items-center justify-start gap-[6px]">
                            <img src="assets/images/icons/location.svg" class="w-6 h-6 icon" alt="icon">
                            <p class="font-semibold">${property.neighborhood || ''} - ${property.city || ''}</p>
                        </div>
                        <div class="grid grid-cols-3 gap-4 mt-2">
                            <div class="flex items-center gap-2">
                                <img src="assets/images/icons/bedroom.svg" class="w-5 h-5" alt="Quartos">
                                <span>${property.bedrooms || 0} Quartos</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <img src="assets/images/icons/bathroom.svg" class="w-5 h-5" alt="Banheiros">
                                <span>${property.bathrooms || 0} Banhos</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <img src="assets/images/icons/area.svg" class="w-5 h-5" alt="Área">
                                <span>${property.area || 0}m²</span>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        `;
        
        grid.appendChild(cardDiv);
    });
    
    // Atualiza a paginação
    updatePagination(properties.length);
}

// Função para atualizar os controles de paginação
function updatePagination(totalItems) {
    // Busca o container de paginação
    let paginationContainer = document.querySelector('.flex.items-center.justify-center.gap-2.mt-\\[50px\\]');
    
    // Se não encontrou o container de paginação, retorna
    if (!paginationContainer) {
        console.error('Container de paginação não encontrado');
        return;
    }

    // Calcula o número total de páginas
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Se não houver páginas suficientes, não exibe a paginação
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    // Exibe o container de paginação
    paginationContainer.style.display = 'flex';
    
    // Limpa o conteúdo atual da paginação
    paginationContainer.innerHTML = '';
    
    // Adiciona botão "Anterior" se não estiver na primeira página
    if (currentPage > 1) {
        const prevButton = document.createElement('a');
        prevButton.href = 'javascript:void(0)';
        prevButton.className = 'flex items-center justify-center w-10 h-10 rounded-full border border-[#E0DEF7] font-bold';
        prevButton.innerHTML = '&lt;';
        prevButton.title = 'Página anterior';
        prevButton.addEventListener('click', () => {
            currentPage--;
            displayProperties(currentProperties);
        });
        paginationContainer.appendChild(prevButton);
    }
    
    // Determina quais números de página mostrar
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajusta o intervalo se estiver próximo ao início ou fim
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Adiciona a primeira página e reticências se necessário
    if (startPage > 1) {
        // Primeira página
        const firstPageBtn = createPageButton(1);
        paginationContainer.appendChild(firstPageBtn);
        
        // Reticências se houver mais de uma página entre a primeira e o início do intervalo
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'mx-2';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    // Adiciona os botões para as páginas no intervalo calculado
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i);
        paginationContainer.appendChild(pageBtn);
    }
    
    // Adiciona a última página e reticências se necessário
    if (endPage < totalPages) {
        // Reticências se houver mais de uma página entre o fim do intervalo e a última
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'mx-2';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        // Última página
        const lastPageBtn = createPageButton(totalPages);
        paginationContainer.appendChild(lastPageBtn);
    }
    
    // Adiciona botão "Próximo" se não estiver na última página
    if (currentPage < totalPages) {
        const nextButton = document.createElement('a');
        nextButton.href = 'javascript:void(0)';
        nextButton.className = 'flex items-center justify-center w-10 h-10 rounded-full border border-[#E0DEF7] font-bold';
        nextButton.innerHTML = '&gt;';
        nextButton.title = 'Próxima página';
        nextButton.addEventListener('click', () => {
            currentPage++;
            displayProperties(currentProperties);
        });
        paginationContainer.appendChild(nextButton);
    }
    
    // Função auxiliar para criar um botão de página
    function createPageButton(pageNum) {
        const button = document.createElement('a');
        button.href = 'javascript:void(0)';
        button.className = `flex items-center justify-center w-10 h-10 rounded-full ${pageNum === currentPage ? 'bg-[#142a3d] text-white' : 'border border-[#E0DEF7]'} font-bold`;
        button.textContent = pageNum;
        
        if (pageNum !== currentPage) {
            button.addEventListener('click', () => {
                currentPage = pageNum;
                displayProperties(currentProperties);
            });
        }
        
        return button;
    }
}

// Configurar carregamento de imóveis quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Carregar imóveis em destaque na página inicial
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
  loadFeaturedProperties();
  } else if (
    window.location.pathname.includes('venda.html') ||
    window.location.pathname.includes('aluguel.html') ||
    window.location.pathname.includes('lancamentos.html')
  ) {
    loadPropertiesByType();
  }
  
  // Carregar detalhes do imóvel na página de detalhes
  loadPropertyDetails();
  
  // Carregar estatísticas de imóveis
  loadPropertyStats();
  
  // Configurar formulário de contato
  const contactForm = document.querySelector('form[action="contact-sent.html"]');
  if (contactForm) {
    contactForm.action = 'javascript:void(0)';
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
  
  // Carrega os imóveis quando a página estiver pronta
  loadProperties();
}); 