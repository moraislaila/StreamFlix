let usuarioAtual = null; // guarda { id, nome, usuario, telefone, foto_perfil } — só vendedor loga

// --- 1. filmes ---
async function carregarSessao(filtroModelo = '') {
  const params = new URLSearchParams();
  if (filtroModelo) params.append('modelo', filtroModelo);

  const url = `/api/anuncios${
    params.toString() ? '?' + params.toString() : ''
  }`;
  const resp = await fetch(url);
  const anuncios = await resp.json();

  if (filtroModelo && anuncios.length === 0) {
    document.getElementById('sessao').innerHTML =
      '<p>Nenhum filme encontrado</p>';
    return;
  }
  renderizarSessao(anuncios);
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function renderizarSessao(anuncios) {
  const sessao = document.getElementById('sessao');
  sessao.innerHTML = anuncios
    .map(
      (a) => `
      <div class="anuncio-card">
        <img class="foto" src="/uploads/${a.imagem}" />
        <div class="tooltip">Anunciado por: @${a.vendedor_usuario}<br/>Local: ${
        a.local
      }</div>
        <div class="rodape-card">
          <span class="titulo">${a.titulo}</span>
          <div class="linha-preco">
            <span class="preco">${formatarPreco(a.preco)}</span>
            <div class="acoes">
              <button class="btn-mensagem" data-id="${a.id}">Mensagem</button>
              <img class="interesse-icone" data-id="${
                a.id
              }" src="assets/coracao.svg" />
              <span class="contador">${a.interesses}</span>
            </div>
          </div>
        </div>
      </div>
    `,
    )
    .join('');

  document.querySelectorAll('.interesse-icone').forEach((icone) => {
    icone.addEventListener('click', () =>
      abrirModalInteresse(icone.dataset.id, icone),
    );
  });
  document.querySelectorAll('.btn-mensagem').forEach((btn) => {
    btn.addEventListener('click', () => abrirModalMensagem(btn.dataset.id));
  });
}

carregarSessao(); // primeira carga, sem reload de página

// --- 2. INTERESSES ---
let anuncioIdInteresse = null;
let iconeInteresseAtual = null;

function abrirModalInteresse(anuncioId, icone) {
  anuncioIdInteresse = anuncioId;
  iconeInteresseAtual = icone;
  document.getElementById('interesseNome').value = '';
  document.getElementById('interesseContato').value = '';
  document.getElementById('erroInteresse').textContent = '';
  document.getElementById('modalInteresse').classList.remove('oculto');
}

document
  .getElementById('fecharModalInteresse')
  .addEventListener('click', () =>
    document.getElementById('modalInteresse').classList.add('oculto'),
  );
document
  .getElementById('btnCancelarInteresse')
  .addEventListener('click', () =>
    document.getElementById('modalInteresse').classList.add('oculto'),
  );

document
  .getElementById('btnConfirmarInteresse')
  .addEventListener('click', async () => {
    const nome = document.getElementById('interesseNome').value.trim();
    const contato = document.getElementById('interesseContato').value.trim();

    if (!nome || !contato) {
      document.getElementById('erroInteresse').textContent =
        'Preencha nome e contato.';
      return;
    }

    const resp = await fetch(`/api/interesses/${anuncioIdInteresse}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente_nome: nome, cliente_contato: contato }),
    });
    const { interesses } = await resp.json();

    iconeInteresseAtual.classList.add('ativa');
    iconeInteresseAtual
      .closest('.linha-preco')
      .querySelector('.contador').textContent = interesses;

    document.getElementById('modalInteresse').classList.add('oculto');
  });

// --- 2-B. MENSAGEM AO VENDEDOR ---
let anuncioIdMensagem = null;

function abrirModalMensagem(anuncioId) {
  anuncioIdMensagem = anuncioId;
  document.getElementById('mensagemNome').value = '';
  document.getElementById('mensagemContato').value = '';
  document.getElementById('mensagemTexto').value = '';
  document.getElementById('erroMensagem').textContent = '';
  document.getElementById('modalMensagem').classList.remove('oculto');
}

document
  .getElementById('fecharModalMensagem')
  .addEventListener('click', () =>
    document.getElementById('modalMensagem').classList.add('oculto'),
  );
document
  .getElementById('btnCancelarMensagem')
  .addEventListener('click', () =>
    document.getElementById('modalMensagem').classList.add('oculto'),
  );

document
  .getElementById('btnEnviarMensagem')
  .addEventListener('click', async () => {
    const nome = document.getElementById('mensagemNome').value.trim();
    const contato = document.getElementById('mensagemContato').value.trim();
    const texto = document.getElementById('mensagemTexto').value.trim();

    if (!nome || !contato || !texto) {
      document.getElementById('erroMensagem').textContent =
        'Preencha todos os campos.';
      return;
    }

    await fetch(`/api/mensagens/${anuncioIdMensagem}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente_nome: nome,
        cliente_contato: contato,
        mensagem: texto,
      }),
    });

    document.getElementById('modalMensagem').classList.add('oculto');
  });

// --- 3. AUTENTICAÇÃO (SÓ VENDEDOR) ---
const btnLogin = document.getElementById('btnLogin');

btnLogin.addEventListener('click', () => {
  if (usuarioAtual) {
    // LOGOUT
    usuarioAtual = null;
    document.getElementById('userSection').classList.add('oculto');
    document.getElementById('fotoPerfil').src = './assets/logo/logo.jpg';
    btnLogin.textContent = 'Entrar';
    carregarSessao();
  } else {
    abrirModalLogin();
  }
});

function abrirModalLogin() {
  document.getElementById('loginUsuario').value = '';
  document.getElementById('loginSenha').value = '';
  document.getElementById('erroUsuario').textContent = '';
  document.getElementById('erroSenha').textContent = '';
  document.getElementById('erroLogin').textContent = '';

  const modalLogin = document.getElementById('modalLogin');
  modalLogin.classList.remove('oculto');
  modalLogin.showModal();
}

function fecharModalLogin() {
  const modalLogin = document.getElementById('modalLogin');
  modalLogin.close();
  modalLogin.classList.add('oculto');
}

document
  .getElementById('fecharModal')
  .addEventListener('click', fecharModalLogin);
document
  .getElementById('btnCancelar')
  .addEventListener('click', fecharModalLogin);

document
  .getElementById('btnConfirmarLogin')
  .addEventListener('click', async () => {
    // ESTE ERA O BUG: usuario/senha nunca eram lidos dos inputs.
    const usuario = document.getElementById('loginUsuario').value.trim();
    const senha = document.getElementById('loginSenha').value.trim();

    document.getElementById('erroUsuario').textContent = '';
    document.getElementById('erroSenha').textContent = '';
    document.getElementById('erroLogin').textContent = '';

    let temErro = false;

    if (!usuario) {
      document.getElementById('erroUsuario').textContent = 'Informe o usuário.';
      temErro = true;
    }
    if (!senha) {
      document.getElementById('erroSenha').textContent = 'Informe a senha.';
      temErro = true;
    }
    if (temErro) return;

    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha }),
    });

    if (!resp.ok) {
      document.getElementById('erroLogin').textContent =
        'Usuário não encontrado ou senha incorreta';
      return;
    }

    usuarioAtual = await resp.json();
    fecharModalLogin();
    atualizarHeaderLogado();
  });

// Versão de atualizarHeaderLogado
function atualizarHeaderLogado() {
  document.getElementById('userSection').classList.remove('oculto');
  document.getElementById('nomeUsuario').textContent = usuarioAtual.usuario;

  if (usuarioAtual.foto_perfil) {
    document.getElementById(
      'fotoPerfil',
    ).src = `/uploads/${usuarioAtual.foto_perfil}`;
  }

  const btnPerfil = document.getElementById('btnVerPerfil');
  if (btnPerfil) {
    btnPerfil.disabled = usuarioAtual.tipo && usuarioAtual.tipo !== 'vendedor';
  }

  btnLogin.textContent = 'Logout';

  // Recarrega sessao exibindo os anúncios com interesse marcado pelo usuário logado
  carregarSessao();
}

// --- 4. BUSCA POR MODELO ---
function executarBusca() {
  const termo = document.getElementById('inputBusca').value.trim();
  carregarSessao(termo);
}

document.getElementById('inputBusca').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') executarBusca();
});

const iconeLupa = document.querySelector('.icone-lupa');
if (iconeLupa) {
  iconeLupa.addEventListener('click', executarBusca);
}

// --- 5. PAINEL DE PERFIL ---
document.getElementById('btnVerPerfil').addEventListener('click', async () => {
  const painelPerfil = document.getElementById('painelPerfil');
  const listaAnuncios = document.getElementById('listaAnunciosPerfil');
  painelPerfil.classList.remove('oculto');

  try {
    const resp = await fetch(`/api/perfil/${usuarioAtual.id}`);
    if (!resp.ok) throw new Error('Falha ao carregar o perfil');
    const dados = await resp.json();

    document.getElementById('totalInteresses').textContent =
      dados.totalInteresses;
    document.getElementById('totalAnuncios').textContent = dados.totalAnuncios;
    listaAnuncios.innerHTML = dados.anuncios
      .map(
        (a) => `
    <div class="item-perfil">
      <span>${a.titulo} — ${formatarPreco(a.preco)}</span>
      <img class="lixeira" data-id="${a.id}" src="assets/lixeira.svg" />
    </div>
  `,
      )
      .join('');

    document.querySelectorAll('.lixeira').forEach((icone) => {
      icone.addEventListener('click', async () => {
        await fetch(`/api/anuncios/${icone.dataset.id}`, { method: 'DELETE' });
        document.getElementById('btnVerPerfil').click();
        carregarSessao();
      });
    });
  } catch (error) {
    listaAnuncios.textContent = 'Não foi possível carregar seus filmes.';
  }
});

document.getElementById('fecharPainel').addEventListener('click', () => {
  document.getElementById('painelPerfil').classList.add('oculto');
});

const modalCadastro = document.getElementById('modalCadastro');

document.getElementById('btnSeusFilmes').addEventListener('click', () => {
  modalCadastro.showModal();
});

document
  .getElementById('fecharModalCadastro')
  .addEventListener('click', () => modalCadastro.close());

modalCadastro.addEventListener('click', (event) => {
  if (event.target === modalCadastro) modalCadastro.close();
});
