const API_URL = "http://localhost:5000";

let remedioEditandoId = null;

function carregarTudo() {
    carregarRemedios();
    carregarSelectRemedios('dose-remedio');
    carregarSelectRemedios('historico-remedio', 'Selecione...');
}

function carregarRemedios() {
    fetch(API_URL + '/remedios')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var remedios = data.remedios || [];
            document.getElementById('total-remedios').textContent = remedios.length;
            var lista = document.getElementById('remedios-lista');
            lista.innerHTML = '';

            if (remedios.length === 0) {
                lista.innerHTML = '<p>Nenhum remédio cadastrado.</p>';
                return;
            }

            remedios.forEach(function (r) {
                lista.innerHTML += '<div class="col-sm-6 col-lg-3">' +
                    '<div class="card p-3">' +
                    '<strong>' + r.nome + '</strong>' +
                    '<p class="mb-0">' + r.dosagem + ' ' + r.unidade + ' à cada ' + r.frequencia_horas + 'h' +
                    '<div id="detalhe-' + r.id + '" class="small text-muted mt-2"></div>' +
                    '<div class="d-flex gap-1 mt-2">' +
                    '<button class="btn btn-outline-secondary btn-sm flex-fill" onclick="verDetalhes(' + r.id + ')">Detalhes</button>' +
                    '<button class="btn btn-outline-primary btn-sm flex-fill" onclick="editarRemedio(' + r.id + ')">Editar</button>' +
                    '<button class="btn btn-outline-danger btn-sm flex-fill" onclick="deletarRemedio(' + r.id + ')">Remover</button>' +
                    '</div>' +
                    '</div></div>';
            });
        });
}

function verDetalhes(id) {
    var div = document.getElementById('detalhe-' + id);

    if (div.innerHTML) {
        div.innerHTML = '';
        return;
    }

    fetch(API_URL + '/remedio?id=' + id)
        .then(function (res) { return res.json(); })
        .then(function (r) {
            div.innerHTML =
                'Dosagem: ' + r.dosagem + 'mg (' + r.unidade + ')<br>' +
                'Frequência: a cada ' + r.frequencia_horas + 'h<br>' +
                'Início: ' + r.horario_inicio + '<br>' +
                'Observações: ' + (r.observacoes || '—');
        });
}

function cadastrarRemedio() {
    var body = {
        nome: document.getElementById('nome').value,
        dosagem: parseFloat(document.getElementById('dosagem').value),
        unidade: document.getElementById('unidade').value,
        frequencia_horas: parseInt(document.getElementById('frequencia').value),
        horario_inicio: document.getElementById('horario').value,
        observacoes: document.getElementById('observacoes').value || null
    };

    var editando = remedioEditandoId !== null;
    var url = editando ? API_URL + '/remedio?id=' + remedioEditandoId : API_URL + '/remedio';
    var metodo = editando ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var msg = document.getElementById('msg-cadastrar');
            if (data.id) {
                msg.textContent = editando ? 'Remédio atualizado com sucesso!' : 'Remédio cadastrado com sucesso!';
                msg.style.color = 'green';
                cancelarEdicao();
                carregarTudo();
            } else {
                msg.textContent = data.message || 'Erro ao salvar.';
                msg.style.color = 'red';
            }
        });
}

function editarRemedio(id) {
    fetch(API_URL + '/remedio?id=' + id)
        .then(function (res) { return res.json(); })
        .then(function (r) {
            document.getElementById('nome').value = r.nome;
            document.getElementById('dosagem').value = r.dosagem;
            document.getElementById('unidade').value = r.unidade;
            document.getElementById('frequencia').value = r.frequencia_horas;
            document.getElementById('horario').value = r.horario_inicio;
            document.getElementById('observacoes').value = r.observacoes || '';

            remedioEditandoId = id;
            document.getElementById('titulo-cadastrar').textContent = 'Editar Remédio';
            document.getElementById('btn-cadastrar').textContent = 'Salvar alterações';
            document.getElementById('btn-cancelar').classList.remove('d-none');
            document.getElementById('msg-cadastrar').textContent = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
}

function cancelarEdicao() {
    remedioEditandoId = null;
    document.getElementById('form-cadastrar').reset();
    document.getElementById('titulo-cadastrar').textContent = 'Cadastrar Remédio';
    document.getElementById('btn-cadastrar').textContent = 'Cadastrar';
    document.getElementById('btn-cancelar').classList.add('d-none');
}

function deletarRemedio(id) {
    if (!confirm('Deseja remover este remédio?')) return;

    fetch(API_URL + '/remedio?id=' + id, { method: 'DELETE' })
        .then(function () {
            carregarTudo();
        });
}

function carregarSelectRemedios(selectId, placeholder) {
    fetch(API_URL + '/remedios')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var remedios = data.remedios || [];
            var select = document.getElementById(selectId);
            select.innerHTML = placeholder ? '<option value="">' + placeholder + '</option>' : '';

            remedios.forEach(function (r) {
                select.innerHTML += '<option value="' + r.id + '">' + r.nome + ' ' + r.dosagem + 'mg</option>';
            });
        });
}

function registrarDose() {
    var msg = document.getElementById('msg-dose');
    var remedioId = parseInt(document.getElementById('dose-remedio').value);

    if (isNaN(remedioId)) {
        msg.textContent = 'Selecione um remédio.';
        msg.style.color = 'red';
        return;
    }

    var body = {
        remedio_id: remedioId,
        observacoes: document.getElementById('dose-obs').value || null
    };

    fetch(API_URL + '/dose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(function (res) {
            return res.json().then(function (data) {
                return { ok: res.ok, data: data };
            });
        })
        .then(function (res) {
            if (res.ok && res.data.id) {
                msg.textContent = 'Dose registrada com sucesso!';
                msg.style.color = 'green';
                document.getElementById('form-dose').reset();
            } else {
                msg.textContent = res.data.message || 'Erro ao registrar.';
                msg.style.color = 'red';
            }
        })
        .catch(function () {
            msg.textContent = 'Erro de conexão com o servidor.';
            msg.style.color = 'red';
        });
}

function carregarHistorico() {
    var id = document.getElementById('historico-remedio').value;
    if (!id) {
        document.getElementById('historico-lista').innerHTML = '';
        return;
    }

    fetch(API_URL + '/doses?id=' + id)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var doses = data.doses || [];
            var lista = document.getElementById('historico-lista');
            lista.innerHTML = '';

            if (doses.length === 0) {
                lista.innerHTML = '<p>Nenhuma dose registrada.</p>';
                return;
            }

            doses.forEach(function (d) {
                lista.innerHTML += '<div class="card p-3 mb-2">' +
                    '<p class="mb-0"><strong>' + d.data_hora + '</strong></p>' +
                    (d.observacoes ? '<p class="mb-0">' + d.observacoes + '</p>' : '') +
                    '</div>';
            });
        });
}

carregarTudo();