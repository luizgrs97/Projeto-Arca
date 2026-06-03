function atualizarResumo(campo, valor){
    let textosPadrao = {
        local: 'Nenhum local selecionado',
        data: 'Nenhuma data selecionada',
        animal: 'Nenhum animal selecionado',
    }

    let elemento = document.getElementById('resumo-' + campo).
    innerHTML = valor || textosPadrao[campo]
}

function confirmarAgendamento() {
  document.querySelectorAll('select').forEach(select => {
    select.selectedIndex = 0
  })

  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.checked = false
  })

  document.getElementById('resumo-local').textContent = 'Nenhum local selecionado'
  document.getElementById('resumo-data').textContent = 'Nenhuma data selecionada'
  document.getElementById('resumo-animal').textContent = 'Nenhum animal selecionado'

  alert('Agendamento confirmado! ✅')
}