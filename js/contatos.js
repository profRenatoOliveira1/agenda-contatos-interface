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
                window.location.href = `../atualizar.html?idContato=${contato.idContato}`
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

async function buscarContato() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const idContato = urlParams.get('idContato');

    try {
        const respostaAPI = await fetch(`${enderecoServidor}${endpointContatos}/${idContato}`);

        if (!respostaAPI.ok) {
            console.error(`Erro na requisição: ${respostaAPI.status} - ${await respostaAPI.text()}`);
            return;
        }

        const jsonContato = await respostaAPI.json();

        preencherFormsAtualizacao(jsonContato);
    } catch (error) {
        // Caso ocorra algum erro na requisição ou no processamento, exibe um alerta ao usuário
        alert('Erro ao buscar informações do contato.');

        // Exibe o erro completo no console para facilitar o diagnóstico durante o desenvolvimento
        console.error(`Erro ao buscar informações do contato. ${error}`);

        // Encerra a função retornando vazio
        return;
    }
}

async function preencherFormsAtualizacao(contato) {
    document.getElementById('floatingInputId').value = contato.idContato;
    document.getElementById('floatingInputNome').value = contato.nome;
    document.getElementById('floatingInputTelefone').value = contato.telefone;
    document.getElementById('floatingInputEmail').value = contato.email;
    // Converter para yyyy-MM-dd
    if (contato.aniversario) {
        const data = new Date(contato.aniversario);
        const yyyy = data.getFullYear();
        const mm = String(data.getMonth() + 1).padStart(2, '0');
        const dd = String(data.getDate()).padStart(2, '0');
        document.getElementById('floatingInputAniversario').value = `${yyyy}-${mm}-${dd}`;
    }
    document.getElementById('floatingInputEndereco').value = contato.endereco;
}

async function enviarFormularioAtualizacao(event) {
    // Impede que o formulário seja enviado da forma tradicional (recarregando a página)
    event.preventDefault();

    // Cria um objeto cliente com os dados preenchidos no formulário
    const contato = {
        idContato: document.getElementById('floatingInputId').value,
        nome: document.getElementById('floatingInputNome').value,
        telefone: document.getElementById('floatingInputTelefone').value,
        email: document.getElementById('floatingInputEmail').value,
        aniversario: document.getElementById('floatingInputAniversario').value,
        endereco: document.getElementById('floatingInputEndereco').value
    };

    // Inicia um bloco try/catch para tratar possíveis erros na requisição
    try {
        // Envia uma requisição HTTP PUT para a API, atualizando os dados do cliente
        const respostaAPI = await fetch(`${enderecoServidor}${endpointContatos}/${contato.idContato}`, {
            method: 'PUT', // método HTTP usado para atualizar dados
            headers: {
                'Content-type': 'application/json' // informa que os dados estão no formato JSON
            },
            body: JSON.stringify(contato) // transforma o objeto cliente em uma string JSON para envio
        });

        // Verifica se a resposta da API foi bem-sucedida
        if (!respostaAPI.ok) {
            // Exibe um alerta informando que houve erro na atualização
            alert('Erro ao atualizar contato.');

            // Exibe no console um erro com o código de status da resposta e o texto retornado pela API.
            // Isso ajuda a identificar o motivo da falha na requisição.
            console.error('Erro na requisição:', respostaAPI.status, await respostaAPI.text());
        }

        // Exibe um alerta informando que o cliente foi atualizado com sucesso
        alert('contato atualizado com sucesso');

        // Redireciona o usuário para a página de lista de clientes
        window.location.href = '/index.html';
    } catch (error) {
        // Caso ocorra algum erro, exibe uma mensagem no console para ajudar na depuração
        console.error('Erro ao fazer requisição.');
        return;
    }
}