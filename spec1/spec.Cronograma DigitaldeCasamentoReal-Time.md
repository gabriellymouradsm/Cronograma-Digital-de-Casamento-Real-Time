


# Cronograma Digital de Casamento Real-Time

# Contexto

Criar uma **aplicação SPA (Single Page Application)** para assessores e cerimonialistas gerenciarem o fluxo de horários, protocolos e tarefas em tempo real durante o dia do casamento.

# Requisitos

1.  **Gerenciamento de Marcos:** O usuário pode visualizar, adicionar, marcar como concluído e excluir marcos temporais do evento (ex: 18:00 - Chegada da Noiva).
2.  **Persistência Local:** Salvar o estado do cronograma automaticamente para que nenhuma informação seja perdida caso a página seja recarregada no meio do casamento.
3.  **Indicador de Progresso:** Exibir em tempo real a porcentagem do evento que já foi executada com sucesso com base nas tarefas concluídas.

# Recursos Adicionais

1.  **Ajuste em Cascata (Efeito Impacto):** Botões rápidos para adicionar minutos de atraso (+5 min, +15 min, +30 min). Ao acionar, o sistema recalcula de forma automática e instantânea o horário de todas as tarefas subsequentes que ainda não foram concluídas.
2.  **Filtros de Visualização Dinâmicos:** Permitir alternar a visualização da linha do tempo entre: "Ver Tudo", "Apenas Pendentes" e "Apenas Concluídos".

# Stack

-   **HTML5, CSS3 e JavaScript Puro (Vanilla)**
-   **Tailwind CSS** (via CDN oficial) para acelerar a estilização e reduzir código CSS customizado.
-   **Hospedagem:** Preparado para publicação direta e gratuita no **GitHub Pages**.

# UI/UX

-   **Mobile First:** Interface totalmente otimizada para smartphones, visto que a equipe de assessoria utiliza o app de pé durante a execução do evento.
-   **Estética de Luxo/Wedding:** Uso de paleta de cores sofisticada (tons pastéis, neutros e terrosos claros) com tipografia serifada elegante.
-   **Micro-interações:** Transições suaves em efeitos de hover nos botões, animações de fade ao riscar tarefas concluídas e atualização fluida da barra de progresso.

# Instruções para Agentes de IA

1.  Analise sempre a viabilidade do desenvolvimento.
2.  Não havendo viabilidade, não execute a tarefa e solicite interação humana.
3.  Todo ajuste, correção ou incrementação deve ser registrado em um arquivo de backlog. Salve o arquivo em `/spec/backlog.md` registrando a data, a hora e a tarefa executada.

