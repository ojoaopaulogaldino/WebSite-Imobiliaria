-- Esquema do banco de dados para sistema de gerenciamento imobiliário
-- Criado em: 16/04/2025

-- Configurações
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Base de dados
CREATE DATABASE IF NOT EXISTS `first_office` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `first_office`;

--
-- Tabela para usuários do painel administrativo
--
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `nivel_acesso` enum('admin','editor','visualizador') NOT NULL DEFAULT 'editor',
  `data_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acesso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tabela para imóveis
--
CREATE TABLE `imoveis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `tipo_anuncio` enum('venda','aluguel','lancamento') NOT NULL,
  `tipo_imovel` varchar(50) NOT NULL,
  `preco` decimal(12,2) NOT NULL,
  `status` enum('ativo','inativo','vendido') NOT NULL DEFAULT 'ativo',
  `bairro` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `area` int(11) DEFAULT NULL,
  `quartos` int(11) DEFAULT NULL,
  `banheiros` int(11) DEFAULT NULL,
  `vagas` int(11) DEFAULT NULL,
  `suites` int(11) DEFAULT NULL,
  `mobiliado` enum('sim','nao','parcial') DEFAULT 'nao',
  `descricao` text,
  `destacado` tinyint(1) NOT NULL DEFAULT '0',
  `data_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `cidade_bairro` (`cidade`,`bairro`),
  KEY `status` (`status`),
  KEY `tipo_anuncio` (`tipo_anuncio`),
  KEY `tipo_imovel` (`tipo_imovel`),
  KEY `destacado` (`destacado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tabela para comodidades dos imóveis
--
CREATE TABLE `imoveis_comodidades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imovel_id` int(11) NOT NULL,
  `comodidade` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `imovel_comodidade` (`imovel_id`,`comodidade`),
  CONSTRAINT `fk_imovel_comodidade` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tabela para imagens dos imóveis
--
CREATE TABLE `imoveis_imagens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imovel_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `tamanho` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT '0',
  `ordem` int(11) NOT NULL DEFAULT '0',
  `data_upload` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `imovel_id` (`imovel_id`),
  CONSTRAINT `fk_imovel_imagem` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tabela para contatos/mensagens recebidas
--
CREATE TABLE `contatos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `mensagem` text NOT NULL,
  `imovel_id` int(11) DEFAULT NULL,
  `tipo` enum('geral','imovel') NOT NULL DEFAULT 'geral',
  `lido` tinyint(1) NOT NULL DEFAULT '0',
  `data_envio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_leitura` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `imovel_id` (`imovel_id`),
  KEY `lido` (`lido`),
  CONSTRAINT `fk_contato_imovel` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tabela para configurações da imobiliária
--
CREATE TABLE `configuracoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_site` varchar(100) NOT NULL DEFAULT 'First Office',
  `logo` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `horario_funcionamento` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `descricao_site` text,
  `meta_keywords` text,
  `meta_description` text,
  `google_analytics` varchar(50) DEFAULT NULL,
  `data_atualizacao` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dados iniciais para a tabela de configurações
--
INSERT INTO `configuracoes` (`id`, `nome_site`, `telefone`, `whatsapp`, `email`, `endereco`, `bairro`, `cidade`, `estado`, `cep`, `complemento`, `horario_funcionamento`, `facebook`, `instagram`, `meta_keywords`, `meta_description`) 
VALUES (1, 'First Office', '(11) 3333-4444', '(11) 99999-8888', 'contato@firstoffice.com.br', 'Av. Paulista, 1000', 'Bela Vista', 'São Paulo', 'SP', '01310-100', 'Conj. 1010', 'Segunda a Sexta: 9h às 18h', 'https://facebook.com/firstoffice', 'https://instagram.com/firstoffice', 'imóveis, apartamentos, casas, imóveis de luxo, alto padrão, são paulo, comprar, alugar, lançamentos', 'First Office - Imobiliária especializada em imóveis de alto padrão em São Paulo.');

--
-- Dados iniciais para a tabela de usuários (senha padrão: admin123)
--
INSERT INTO `usuarios` (`nome`, `email`, `username`, `senha`, `nivel_acesso`) 
VALUES ('Administrador', 'admin@firstoffice.com.br', 'admin', '$2y$10$YMGjgKSJNKQcYTL3AxIIIOHIJXGFVB7J5tFz.YhPYOAaMwDu9hl.O', 'admin'); 