const enderecoServidor = `http://localhost:3333`;
const endpointContatos = `/api/contato`;

async function buscarContatos() {
    const respostaAPI = await fetch(`${enderecoServidor}${endpointContatos}`);

    if (!respostaAPI.ok) {
        console.error(`Erro na requisição: ${respostaAPI.status} - ${await respostaAPI.text()}`);
        return;
    }

    const jsonContatos = await respostaAPI.json();

    return jsonContatos;
}

async function montarTabelaContatos() {
    const listaDeContatos = await buscarContatos();

    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    listaDeContatos.forEach(contato => {
        const tr = document.createElement('tr');
        const telefoneLicitado = formatarTelefone(contato.telefone);
        const dataFormatada = formatarDataAniversario(contato.aniversario);

        tr.innerHTML =
            `
            <tr>
                <th scope="row">${contato.idContato}</th>
                <td>${contato.nome}</td>
                <td>${telefoneLicitado}</td>
                <td>${contato.email}</td>
                <td>${dataFormatada}</td>
                <td>${contato.endereco}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-delete">Deletar</button>
                    <button type="button" class="btn btn-primary btn-update">Atualizar</button>
                </td>
            </tr>
        `

        // Exemplo de uso nos botões
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            abrirModal(`Deseja realmente deletar o contato ${contato.idContato}?`, () => {
                console.log("Deletar confirmado:", contato.idContato);
                deletarContato(contato.idContato);
            });
        });

        tr.querySelector('.btn-update').addEventListener('click', () => {
            abrirModal(`Deseja atualizar o contato ${contato.idContato}?`, () => {
                console.log("Atualizar confirmado:", contato.idContato);
            });
        });

        tbody.appendChild(tr);
    });
}

function formatarTelefone(telefone) {
    // Remove caracteres não numéricos
    const apenasNumeros = telefone.replace(/\D/g, '');

    // Formata para (xx) x xxxx-xxxx
    return apenasNumeros.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
}

function formatarDataAniversario(data) {
    if (!data) return '';

    // Se vier como "1900-01-01T00:00:00.000Z" ou "1900-01-01"
    const apenasData = data.split('T')[0]; // pega só a parte da data
    const [ano, mes, dia] = apenasData.split('-');

    return `${dia}/${mes}/${ano}`;
}

async function enviarFormulario(event) {
    event.preventDefault();

    const contato = {
        nome: document.getElementById('floatingInputNome').value,
        telefone: document.getElementById('floatingInputTelefone').value,
        email: document.getElementById('floatingInputEmail').value,
        aniversario: document.getElementById('floatingInputAniversario').value,
        endereco: document.getElementById('floatingInputEndereco').value,
    }

    console.table(contato);

    try {
        const respostaAPI = await fetch(`${enderecoServidor}${endpointContatos}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contato)
        });

        if (!respostaAPI.ok) {
            alert('Erro ao cadastrar contato.');

            throw new Error('Erro ao fazer requisição à API.');
        }

        alert('Contato cadastrado com sucesso!');

        window.location.href = '/index.html';
    } catch (error) {
        console.error(`Erro ao fazer requisição.`);
        return;
    }
}

async function deletarContato(idContato) {
    try {
        const respostaAPI = await fetch(`${enderecoServidor}${endpointContatos}/${idContato}`, {
            method: 'DELETE'
        });

        if (!respostaAPI.ok) {
            alert('Erro ao remover contato.');

            throw new Error('Erro ao fazer requisição à API.');
        }

        window.location.href = '/index.html';
    } catch (error) {
        console.error(`Erro ao fazer requisição.`);
        return;
    }
}

function abrirModal(mensagem, acao) {
    const modalBody = document.getElementById('acaoModalBody');
    modalBody.textContent = mensagem;

    const confirmarBtn = document.getElementById('confirmarAcao');
    confirmarBtn.onclick = acao;

    const modal = new bootstrap.Modal(document.getElementById('acaoModal'));
    modal.show();
}