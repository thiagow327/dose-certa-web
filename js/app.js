const API_URL = "http://localhost:5000";

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
                    '<p class="mb-0">' + r.dosagem + ' ' + r.unidade + '</p>' +
                    '<p class="mb-0">A cada ' + r.frequencia_horas + 'h · ' + r.horario_inicio + '</p>' +
                    '<button class="btn btn-outline-danger btn-sm mt-2 w-100" onclick="deletarRemedio(' + r.id + ')">Remover</button>' +
                    '</div></div>';
            });
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

    fetch(API_URL + '/remedio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var msg = document.getElementById('msg-cadastrar');
            if (data.id) {
                msg.textContent = 'Remédio cadastrado com sucesso!';
                msg.style.color = 'green';
                document.getElementById('form-cadastrar').reset();
                carregarTudo();
            } else {
                msg.textContent = data.message || 'Erro ao cadastrar.';
                msg.style.color = 'red';
            }
        });
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