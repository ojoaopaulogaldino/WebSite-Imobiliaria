/**
 * Definição das rotas da API para o sistema imobiliário
 */

/**
 * Rotas de Autenticação
 * 
 * POST /api/auth/login - Login do usuário
 * POST /api/auth/logout - Logout do usuário
 * GET /api/auth/me - Obtém informações do usuário atual
 */

/**
 * Rotas de Usuários (Apenas admin)
 * 
 * GET /api/admin/users - Lista todos os usuários
 * GET /api/admin/users/:id - Obtém detalhes de um usuário específico
 * POST /api/admin/users - Cria um novo usuário
 * PUT /api/admin/users/:id - Atualiza um usuário existente
 * DELETE /api/admin/users/:id - Remove um usuário
 */

/**
 * Rotas de Imóveis
 * 
 * GET /api/properties - Lista todos os imóveis (público)
 * GET /api/properties/:id - Obtém detalhes de um imóvel específico (público)
 * GET /api/properties/featured - Obtém imóveis destacados (público)
 * GET /api/properties/search - Busca imóveis com filtros (público)
 * 
 * GET /api/admin/properties - Lista todos os imóveis (admin)
 * GET /api/admin/properties/:id - Obtém detalhes de um imóvel específico (admin)
 * POST /api/admin/properties - Cria um novo imóvel (admin)
 * PUT /api/admin/properties/:id - Atualiza um imóvel existente (admin)
 * DELETE /api/admin/properties/:id - Remove um imóvel (admin)
 */

/**
 * Rotas de Imagens
 * 
 * GET /api/admin/properties/:id/images - Lista imagens de um imóvel (admin)
 * POST /api/admin/properties/:id/images - Faz upload de imagens para um imóvel (admin)
 * DELETE /api/admin/properties/:id/images/:imageId - Remove uma imagem de um imóvel (admin)
 * PUT /api/admin/properties/:id/images/:imageId/main - Define uma imagem como principal (admin)
 */

/**
 * Rotas de Contatos
 * 
 * POST /api/contact - Envia uma mensagem de contato (público)
 * GET /api/admin/contacts - Lista todos os contatos (admin)
 * GET /api/admin/contacts/:id - Obtém detalhes de um contato específico (admin)
 * PUT /api/admin/contacts/:id/read - Marca um contato como lido (admin)
 * DELETE /api/admin/contacts/:id - Remove um contato (admin)
 */

/**
 * Rotas de Dashboard
 * 
 * GET /api/admin/dashboard - Obtém dados para o dashboard (admin)
 */

/**
 * Rotas de Configurações
 * 
 * GET /api/settings - Obtém configurações públicas do site (público)
 * GET /api/admin/settings - Obtém todas as configurações (admin)
 * PUT /api/admin/settings - Atualiza as configurações (admin)
 */ 