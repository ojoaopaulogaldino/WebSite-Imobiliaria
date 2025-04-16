# Painel Administrativo - FirstOffice

## Implementações Realizadas

Foram feitas as seguintes implementações para tornar o painel administrativo funcional:

### Cadastro e Edição de Imóveis
- Formulário de cadastro de imóveis com todos os campos necessários e validações
- Suporte para upload de múltiplas imagens com preview
- Edição de imóveis existentes com preenchimento automático dos dados
- Integração com a API para salvar os dados no servidor

### Listagem de Imóveis
- Listagem dinâmica de imóveis a partir dos dados da API
- Paginação para navegar entre resultados
- Filtros por tipo de imóvel, status e busca por texto
- Ações para editar e excluir imóveis

### Gerenciamento de Contatos
- Listagem de mensagens de contato recebidas dos clientes
- Filtros por status, data e busca por texto
- Visualização detalhada de cada mensagem
- Funcionalidade para responder aos contatos por email
- Opção para arquivar mensagens

### Frontend de Contato
- Formulário de contato no site para visitantes interessados
- Funcionalidade para contatar sobre um imóvel específico
- Validação de campos obrigatórios
- Feedback ao usuário sobre o envio da mensagem

### Dashboard
- Estatísticas reais sobre imóveis cadastrados
- Contadores de propriedades por tipo (venda, aluguel, lançamentos)
- Últimos contatos recebidos
- Atividades recentes no sistema

## Tecnologias Utilizadas
- JavaScript puro para interações do frontend
- Fetch API para comunicação com o backend
- LocalStorage para armazenamento de dados de sessão
- Manipulação do DOM para atualização dinâmica da interface

## Pendências Futuras
- Implementação de autenticação JWT mais robusta
- Upload de imagens com armazenamento em nuvem
- Editor WYSIWYG para descrição dos imóveis
- Sistema de agendamento de visitas
- Relatórios avançados de desempenho

## Como Utilizar
1. Acesse a página de login em `/admin/login.html`
2. Utilize as credenciais de administrador
3. Navegue pelo painel utilizando o menu lateral
4. Para adicionar um novo imóvel, acesse "Imóveis" e clique em "Adicionar Imóvel"
5. Para gerenciar contatos, acesse a seção "Mensagens" 