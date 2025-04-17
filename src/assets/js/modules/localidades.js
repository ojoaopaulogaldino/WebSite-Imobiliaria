/**
 * Módulo para gerenciar estados, cidades e bairros
 */

// URLs da API
const API_STATES = '/api/admin/states';
const API_CITIES = '/api/admin/cities';
const API_NEIGHBORHOODS = '/api/admin/neighborhoods';

// Elementos da UI
let estadosTable, cidadesTable, bairrosTable;
let estadoModal, cidadeModal, bairroModal, confirmModal;
let formEstado, formCidade, formBairro;
let filterEstadoCidade, filterEstadoBairro, filterCidadeBairro;
let estadoSelect, cidadeSelect;
let bairroEstadoSelect, bairroCidadeSelect;
let currentItemId = null;
let currentItemType = null;

/**
 * Inicializa o módulo de localidades
 */
export function initializeLocalidades() {
    // Inicializar referências aos elementos
    estadosTable = document.getElementById('estados-list');
    cidadesTable = document.getElementById('cidades-list');
    bairrosTable = document.getElementById('bairros-list');
    
    estadoModal = document.getElementById('modal-estado');
    cidadeModal = document.getElementById('modal-cidade');
    bairroModal = document.getElementById('modal-bairro');
    confirmModal = document.getElementById('modal-confirmacao');
    
    formEstado = document.getElementById('form-estado');
    formCidade = document.getElementById('form-cidade');
    formBairro = document.getElementById('form-bairro');
    
    filterEstadoCidade = document.getElementById('filter-estado-cidade');
    filterEstadoBairro = document.getElementById('filter-estado-bairro');
    filterCidadeBairro = document.getElementById('filter-cidade-bairro');
    
    estadoSelect = document.getElementById('cidade-estado');
    bairroEstadoSelect = document.getElementById('bairro-estado');
    bairroCidadeSelect = document.getElementById('bairro-cidade');
    
    // Carregar dados iniciais
    loadEstados();
    loadCidades();
    loadBairros();
    
    // Eventos dos botões para adicionar
    document.getElementById('btn-add-estado').addEventListener('click', () => showEstadoModal());
    document.getElementById('btn-add-cidade').addEventListener('click', () => showCidadeModal());
    document.getElementById('btn-add-bairro').addEventListener('click', () => showBairroModal());
    
    // Eventos dos botões de cancelar
    document.getElementById('btn-cancel-estado').addEventListener('click', () => hideEstadoModal());
    document.getElementById('btn-cancel-cidade').addEventListener('click', () => hideCidadeModal());
    document.getElementById('btn-cancel-bairro').addEventListener('click', () => hideBairroModal());
    document.getElementById('btn-cancel-confirmacao').addEventListener('click', () => hideConfirmModal());
    
    // Eventos de formulários
    formEstado.addEventListener('submit', handleEstadoSubmit);
    formCidade.addEventListener('submit', handleCidadeSubmit);
    formBairro.addEventListener('submit', handleBairroSubmit);
    
    // Eventos de filtros
    filterEstadoCidade.addEventListener('change', () => loadCidades());
    filterEstadoBairro.addEventListener('change', () => {
        // Carregar cidades do estado selecionado no filtro de bairros
        loadCidadesForSelect(filterEstadoBairro.value, filterCidadeBairro);
        loadBairros();
    });
    filterCidadeBairro.addEventListener('change', () => loadBairros());
    
    // Eventos de seleção em cascata
    bairroEstadoSelect.addEventListener('change', () => {
        // Carregar cidades do estado selecionado na modal de bairro
        loadCidadesForSelect(bairroEstadoSelect.value, bairroCidadeSelect);
    });
    
    // Botão de confirmação de exclusão
    document.getElementById('btn-confirmar-exclusao').addEventListener('click', handleConfirmaExclusao);
}

// FUNÇÕES PARA ESTADOS

/**
 * Carrega a lista de estados
 */
async function loadEstados() {
    try {
        const response = await fetch(API_STATES);
        const estados = await response.json();
        
        renderEstadosTable(estados);
        populateEstadosSelect(estados);
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
        showError('Não foi possível carregar os estados');
    }
}

/**
 * Renderiza a tabela de estados
 */
function renderEstadosTable(estados) {
    if (estados.length === 0) {
        estadosTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">Nenhum estado cadastrado</td>
            </tr>
        `;
        return;
    }
    
    const rows = estados.map(estado => `
        <tr>
            <td class="px-4 py-3">${estado.id}</td>
            <td class="px-4 py-3">${estado.name}</td>
            <td class="px-4 py-3">${estado.abbreviation}</td>
            <td class="px-4 py-3">
                <div class="flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-800" onclick="editEstado(${estado.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteEstado(${estado.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    estadosTable.innerHTML = rows;
    
    // Adicionar funções globais para editar e excluir estados
    window.editEstado = editEstado;
    window.deleteEstado = deleteEstado;
}

/**
 * Preenche os selects de estados
 */
function populateEstadosSelect(estados) {
    const options = estados.map(estado => 
        `<option value="${estado.id}">${estado.name} (${estado.abbreviation})</option>`
    ).join('');
    
    const defaultOption = '<option value="">Selecione um Estado</option>';
    const filterOption = '<option value="">Todos os Estados</option>';
    
    // Seletores para adicionar cidades e bairros
    estadoSelect.innerHTML = defaultOption + options;
    bairroEstadoSelect.innerHTML = defaultOption + options;
    
    // Filtros
    filterEstadoCidade.innerHTML = filterOption + options;
    filterEstadoBairro.innerHTML = filterOption + options;
}

/**
 * Exibe o modal para adicionar/editar estado
 */
function showEstadoModal(estado = null) {
    // Limpar formulário
    formEstado.reset();
    document.getElementById('estado-id').value = '';
    
    // Definir título do modal
    document.getElementById('modal-estado-title').textContent = estado ? 'Editar Estado' : 'Adicionar Estado';
    
    // Preencher dados se for edição
    if (estado) {
        document.getElementById('estado-id').value = estado.id;
        document.getElementById('estado-nome').value = estado.name;
        document.getElementById('estado-sigla').value = estado.abbreviation;
    }
    
    // Exibir modal
    estadoModal.classList.remove('hidden');
}

/**
 * Esconde o modal de estado
 */
function hideEstadoModal() {
    estadoModal.classList.add('hidden');
}

/**
 * Manipula o envio do formulário de estado
 */
async function handleEstadoSubmit(event) {
    event.preventDefault();
    
    const estadoId = document.getElementById('estado-id').value;
    const nome = document.getElementById('estado-nome').value;
    const sigla = document.getElementById('estado-sigla').value;
    
    const estadoData = {
        name: nome,
        abbreviation: sigla
    };
    
    try {
        let response;
        
        if (estadoId) {
            // Edição
            response = await fetch(`${API_STATES}/${estadoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(estadoData)
            });
        } else {
            // Novo
            response = await fetch(API_STATES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(estadoData)
            });
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao salvar estado');
        }
        
        hideEstadoModal();
        loadEstados();
        
        // Atualizar listas de estados nos selects de cidades e bairros
        const allEstados = document.querySelectorAll('select[data-type="estados"]');
        allEstados.forEach(select => {
            loadEstados();
        });
        
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
        showError(error.message);
    }
}

/**
 * Função para editar um estado
 */
async function editEstado(id) {
    try {
        const response = await fetch(`${API_STATES}/${id}`);
        const estado = await response.json();
        
        showEstadoModal(estado);
    } catch (error) {
        console.error('Erro ao carregar estado para edição:', error);
        showError('Não foi possível carregar os dados do estado');
    }
}

/**
 * Função para confirmar exclusão de estado
 */
function deleteEstado(id) {
    currentItemId = id;
    currentItemType = 'estado';
    document.getElementById('mensagem-confirmacao').textContent = 'Tem certeza que deseja excluir este estado? Esta ação não pode ser desfeita.';
    confirmModal.classList.remove('hidden');
}

// FUNÇÕES PARA CIDADES

/**
 * Carrega a lista de cidades
 */
async function loadCidades() {
    try {
        let url = API_CITIES;
        const estadoId = filterEstadoCidade.value;
        
        if (estadoId) {
            url += `?state_id=${estadoId}`;
        }
        
        const response = await fetch(url);
        const cidades = await response.json();
        
        renderCidadesTable(cidades);
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        showError('Não foi possível carregar as cidades');
    }
}

/**
 * Renderiza a tabela de cidades
 */
function renderCidadesTable(cidades) {
    if (cidades.length === 0) {
        cidadesTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">Nenhuma cidade cadastrada</td>
            </tr>
        `;
        return;
    }
    
    const rows = cidades.map(cidade => `
        <tr>
            <td class="px-4 py-3">${cidade.id}</td>
            <td class="px-4 py-3">${cidade.name}</td>
            <td class="px-4 py-3">${cidade.state_name} (${cidade.state_abbreviation})</td>
            <td class="px-4 py-3">
                ${cidade.image_url ? 
                    `<img src="${cidade.image_url}" alt="${cidade.name}" class="h-12 w-20 object-cover rounded">` : 
                    'Sem imagem'}
            </td>
            <td class="px-4 py-3">
                <div class="flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-800" onclick="editCidade(${cidade.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteCidade(${cidade.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    cidadesTable.innerHTML = rows;
    
    // Adicionar funções globais para editar e excluir cidades
    window.editCidade = editCidade;
    window.deleteCidade = deleteCidade;
}

/**
 * Carrega cidades para um select com base no estado
 */
async function loadCidadesForSelect(estadoId, selectElement) {
    if (!estadoId) {
        selectElement.innerHTML = '<option value="">Selecione uma Cidade</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_CITIES}?state_id=${estadoId}`);
        const cidades = await response.json();
        
        const options = cidades.map(cidade => 
            `<option value="${cidade.id}">${cidade.name}</option>`
        ).join('');
        
        const defaultOption = selectElement === filterCidadeBairro ? 
            '<option value="">Todas as Cidades</option>' : 
            '<option value="">Selecione uma Cidade</option>';
        
        selectElement.innerHTML = defaultOption + options;
    } catch (error) {
        console.error('Erro ao carregar cidades para o select:', error);
        selectElement.innerHTML = '<option value="">Erro ao carregar cidades</option>';
    }
}

/**
 * Exibe o modal para adicionar/editar cidade
 */
function showCidadeModal(cidade = null) {
    // Limpar formulário
    formCidade.reset();
    document.getElementById('cidade-id').value = '';
    document.getElementById('cidade-imagem-preview').classList.add('hidden');
    
    // Definir título do modal
    document.getElementById('modal-cidade-title').textContent = cidade ? 'Editar Cidade' : 'Adicionar Cidade';
    
    // Preencher dados se for edição
    if (cidade) {
        document.getElementById('cidade-id').value = cidade.id;
        document.getElementById('cidade-nome').value = cidade.name;
        document.getElementById('cidade-estado').value = cidade.state_id;
        
        if (cidade.image_url) {
            document.getElementById('cidade-imagem-atual').src = cidade.image_url;
            document.getElementById('cidade-imagem-preview').classList.remove('hidden');
        }
    }
    
    // Exibir modal
    cidadeModal.classList.remove('hidden');
}

/**
 * Esconde o modal de cidade
 */
function hideCidadeModal() {
    cidadeModal.classList.add('hidden');
}

/**
 * Manipula o envio do formulário de cidade
 */
async function handleCidadeSubmit(event) {
    event.preventDefault();
    
    const cidadeId = document.getElementById('cidade-id').value;
    const nome = document.getElementById('cidade-nome').value;
    const estadoId = document.getElementById('cidade-estado').value;
    const imagemInput = document.getElementById('cidade-imagem');
    
    const formData = new FormData();
    formData.append('name', nome);
    formData.append('state_id', estadoId);
    
    if (imagemInput.files.length > 0) {
        formData.append('image', imagemInput.files[0]);
    }
    
    try {
        let response;
        
        if (cidadeId) {
            // Edição
            response = await fetch(`${API_CITIES}/${cidadeId}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            // Novo
            response = await fetch(API_CITIES, {
                method: 'POST',
                body: formData
            });
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao salvar cidade');
        }
        
        hideCidadeModal();
        loadCidades();
        
        // Atualizar selects de cidades em bairros se o estado atual for o mesmo
        if (bairroEstadoSelect.value === estadoId) {
            loadCidadesForSelect(estadoId, bairroCidadeSelect);
        }
        
        if (filterEstadoBairro.value === estadoId) {
            loadCidadesForSelect(estadoId, filterCidadeBairro);
        }
        
    } catch (error) {
        console.error('Erro ao salvar cidade:', error);
        showError(error.message);
    }
}

/**
 * Função para editar uma cidade
 */
async function editCidade(id) {
    try {
        const response = await fetch(`${API_CITIES}/${id}`);
        const cidade = await response.json();
        
        showCidadeModal(cidade);
    } catch (error) {
        console.error('Erro ao carregar cidade para edição:', error);
        showError('Não foi possível carregar os dados da cidade');
    }
}

/**
 * Função para confirmar exclusão de cidade
 */
function deleteCidade(id) {
    currentItemId = id;
    currentItemType = 'cidade';
    document.getElementById('mensagem-confirmacao').textContent = 'Tem certeza que deseja excluir esta cidade? Esta ação não pode ser desfeita.';
    confirmModal.classList.remove('hidden');
}

// FUNÇÕES PARA BAIRROS

/**
 * Carrega a lista de bairros
 */
async function loadBairros() {
    try {
        let url = API_NEIGHBORHOODS;
        const params = [];
        
        const estadoId = filterEstadoBairro.value;
        const cidadeId = filterCidadeBairro.value;
        
        if (estadoId) {
            params.push(`state_id=${estadoId}`);
        }
        
        if (cidadeId) {
            params.push(`city_id=${cidadeId}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        const bairros = await response.json();
        
        renderBairrosTable(bairros);
    } catch (error) {
        console.error('Erro ao carregar bairros:', error);
        showError('Não foi possível carregar os bairros');
    }
}

/**
 * Renderiza a tabela de bairros
 */
function renderBairrosTable(bairros) {
    if (bairros.length === 0) {
        bairrosTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">Nenhum bairro cadastrado</td>
            </tr>
        `;
        return;
    }
    
    const rows = bairros.map(bairro => `
        <tr>
            <td class="px-4 py-3">${bairro.id}</td>
            <td class="px-4 py-3">${bairro.name}</td>
            <td class="px-4 py-3">${bairro.city_name}</td>
            <td class="px-4 py-3">${bairro.state_name} (${bairro.state_abbreviation})</td>
            <td class="px-4 py-3">
                <div class="flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-800" onclick="editBairro(${bairro.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteBairro(${bairro.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    bairrosTable.innerHTML = rows;
    
    // Adicionar funções globais para editar e excluir bairros
    window.editBairro = editBairro;
    window.deleteBairro = deleteBairro;
}

/**
 * Exibe o modal para adicionar/editar bairro
 */
function showBairroModal(bairro = null) {
    // Limpar formulário
    formBairro.reset();
    document.getElementById('bairro-id').value = '';
    
    // Definir título do modal
    document.getElementById('modal-bairro-title').textContent = bairro ? 'Editar Bairro' : 'Adicionar Bairro';
    
    // Preencher dados se for edição
    if (bairro) {
        document.getElementById('bairro-id').value = bairro.id;
        document.getElementById('bairro-nome').value = bairro.name;
        document.getElementById('bairro-estado').value = bairro.state_id;
        
        // Carregar cidades do estado e depois selecionar a cidade do bairro
        loadCidadesForSelect(bairro.state_id, bairroCidadeSelect).then(() => {
            document.getElementById('bairro-cidade').value = bairro.city_id;
        });
    }
    
    // Exibir modal
    bairroModal.classList.remove('hidden');
}

/**
 * Esconde o modal de bairro
 */
function hideBairroModal() {
    bairroModal.classList.add('hidden');
}

/**
 * Manipula o envio do formulário de bairro
 */
async function handleBairroSubmit(event) {
    event.preventDefault();
    
    const bairroId = document.getElementById('bairro-id').value;
    const nome = document.getElementById('bairro-nome').value;
    const cidadeId = document.getElementById('bairro-cidade').value;
    
    const bairroData = {
        name: nome,
        city_id: cidadeId
    };
    
    try {
        let response;
        
        if (bairroId) {
            // Edição
            response = await fetch(`${API_NEIGHBORHOODS}/${bairroId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bairroData)
            });
        } else {
            // Novo
            response = await fetch(API_NEIGHBORHOODS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bairroData)
            });
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao salvar bairro');
        }
        
        hideBairroModal();
        loadBairros();
        
    } catch (error) {
        console.error('Erro ao salvar bairro:', error);
        showError(error.message);
    }
}

/**
 * Função para editar um bairro
 */
async function editBairro(id) {
    try {
        const response = await fetch(`${API_NEIGHBORHOODS}/${id}`);
        const bairro = await response.json();
        
        showBairroModal(bairro);
    } catch (error) {
        console.error('Erro ao carregar bairro para edição:', error);
        showError('Não foi possível carregar os dados do bairro');
    }
}

/**
 * Função para confirmar exclusão de bairro
 */
function deleteBairro(id) {
    currentItemId = id;
    currentItemType = 'bairro';
    document.getElementById('mensagem-confirmacao').textContent = 'Tem certeza que deseja excluir este bairro? Esta ação não pode ser desfeita.';
    confirmModal.classList.remove('hidden');
}

/**
 * Manipula a confirmação de exclusão
 */
async function handleConfirmaExclusao() {
    if (!currentItemId || !currentItemType) {
        hideConfirmModal();
        return;
    }
    
    let apiUrl;
    switch (currentItemType) {
        case 'estado':
            apiUrl = `${API_STATES}/${currentItemId}`;
            break;
        case 'cidade':
            apiUrl = `${API_CITIES}/${currentItemId}`;
            break;
        case 'bairro':
            apiUrl = `${API_NEIGHBORHOODS}/${currentItemId}`;
            break;
        default:
            hideConfirmModal();
            return;
    }
    
    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `Erro ao excluir ${currentItemType}`);
        }
        
        hideConfirmModal();
        
        // Recarregar dados de acordo com o tipo excluído
        switch (currentItemType) {
            case 'estado':
                loadEstados();
                break;
            case 'cidade':
                loadCidades();
                break;
            case 'bairro':
                loadBairros();
                break;
        }
        
    } catch (error) {
        console.error(`Erro ao excluir ${currentItemType}:`, error);
        showError(error.message);
        hideConfirmModal();
    }
}

/**
 * Esconde o modal de confirmação
 */
function hideConfirmModal() {
    confirmModal.classList.add('hidden');
    currentItemId = null;
    currentItemType = null;
}

/**
 * Exibe mensagem de erro
 */
function showError(message) {
    alert(`Erro: ${message}`);
} 