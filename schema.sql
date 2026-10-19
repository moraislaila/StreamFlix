CREATE TABLE tb_usuarios(
    id_usuario SERIAL primary key,
	nome VARCHAR(100) NOT NULL,
	nome_usuario VARCHAR(100),
	email VARCHAR(80) UNIQUE,
	senha VARCHAR(6) NOT NULL,
	imagem_usuario VARCHAR (120),
	tipo VARCHAR(100),
	created_at TIMESTAMP DEFAULT NOW(),
	update_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tb_filme(
	id_filme SERIAL PRIMARY KEY,
	titulo_filme VARCHAR (100) NOT NULL,
	genero VARCHAR (80) NOT NULL,
	url_capa VARCHAR(120) NOT NULL,
	id_usuario INTEGER NOT NULL REFERENCES tb_usuarios(id_usuario),
	created_at TIMESTAMP DEFAULT NOW(),
	update_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tb_curtida(
	id_curtida SERIAL PRIMARY KEY,
	id_usuario INTEGER NOT NULL,
	id_filme INTEGER NOT NULL,
CONSTRAINT fk_usuarios_curtidas FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(id_usuario),
CONSTRAINT fk_filme FOREIGN KEY (id_filme) REFERENCES tb_filme(id_filme),
	created_at TIMESTAMP DEFAULT NOW(),
	update_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tb_minha_lista(
	id_lista SERIAL PRIMARY KEY,
	id_usuario INTEGER NOT NULL,
	id_filme INTEGER NOT NULL,
	CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(id_usuario),
	CONSTRAINT fk_filmes FOREIGN KEY (id_filme) REFERENCES tb_filme(id_filme),
	created_at TIMESTAMP DEFAULT NOW(),
	update_at TIMESTAMP DEFAULT NOW()
);
