import type { Difficulty, RewardedPlacement, SizeId, Theme, Tool } from '@app/catalog'
import type { Axis, CellState } from '@core/engine/grid'

const pluralize = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`

const LINE_NAMES: Record<Axis, string> = { row: 'Fila', col: 'Columna' }

const CELL_STATE_NAMES: Record<CellState, string> = {
  unknown: 'vacía',
  filled: 'rellena',
  crossed: 'marcada',
}

export const strings = {
  appName: 'Nonogram',
  common: {
    back: 'Atrás',
    close: 'Cerrar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    loading: 'Generando puzzle…',
  },
  difficulty: {
    names: {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      expert: 'Experto',
    } satisfies Record<Difficulty, string>,
    bestTime: (time: string) => `Mejor: ${time}`,
  },
  sizes: {
    names: { '5x5': '5x5', '10x10': '10x10', '15x15': '15x15' } satisfies Record<SizeId, string>,
  },
  home: {
    continue: 'Continuar',
    continueDetail: (title: string, time: string) => `${title} · ${time}`,
    quickTitle: (size: string, difficulty: string) => `${size} ${difficulty}`,
    collection: 'Colección',
    collectionDetail: (completed: number, total: number) => `${completed} de ${total} resueltos`,
    quickPlay: 'Partida rápida',
    stats: 'Estadísticas',
    settings: 'Ajustes',
    howToPlay: 'Cómo jugar',
    abandonTitle: '¿Dejar la partida rápida?',
    abandonMessage: 'La partida rápida en curso se contará como abandonada.',
    abandonConfirm: 'Dejarla',
  },
  quickPlay: {
    title: 'Partida rápida',
    size: 'Tamaño',
    difficulty: 'Dificultad',
    start: 'Jugar',
  },
  collection: {
    title: 'Colección',
    sizes: 'Tamaño',
    packProgress: (completed: number, total: number) => `${completed}/${total}`,
    puzzleLabel: (name: string, status: string) => `${name}, ${status}`,
    unknownName: '?',
    statusNew: 'sin empezar',
    statusInProgress: (percent: number) => `en curso, ${percent}%`,
    statusCompleted: (time: string) => `resuelto en ${time}`,
  },
  game: {
    mistakes: (count: number, limit: number | null) =>
      limit === null ? `Errores: ${count}` : `Errores: ${count}/${limit}`,
    pause: 'Pausar',
    undo: 'Deshacer',
    hint: 'Pista',
    hintsLeft: (count: number) => pluralize(count, 'pista gratis hoy', 'pistas gratis hoy'),
    tools: 'Herramienta',
    toolNames: { fill: 'Rellenar', cross: 'Marcar' } satisfies Record<Tool, string>,
    boardLabel: 'Tablero del nonograma',
    rowClues: 'Pistas de filas',
    colClues: 'Pistas de columnas',
    unknownTitle: '?',
    strokeCount: (count: number) => `${count}`,
    zoomControls: 'Zoom del tablero',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    zoomReset: 'Ajustar tablero',
  },
  cell: {
    label: (row: number, col: number, state: CellState) =>
      `Fila ${row + 1}, columna ${col + 1}, ${CELL_STATE_NAMES[state]}`,
    error: 'error',
    hinted: 'pista',
  },
  clue: {
    label: (axis: Axis, index: number, numbers: readonly number[], isDone: boolean) =>
      `${LINE_NAMES[axis]} ${index + 1}: ${numbers.length === 0 ? '0' : numbers.join(' ')}${isDone ? ', completa' : ''}`,
  },
  hints: {
    errors: (count: number) =>
      count === 1 ? 'Esta celda es incorrecta.' : `Hay ${count} celdas incorrectas.`,
    line: (axis: Axis, index: number, count: number) =>
      `${LINE_NAMES[axis]} ${index + 1}: ${pluralize(count, 'celda se deduce', 'celdas se deducen')} solo con sus pistas.`,
    reveal: 'Te revelamos una celda de la línea más restringida.',
  },
  ads: {
    hintTitle: 'Sin pistas gratis',
    hintMessage: (count: number) =>
      `Ya usaste las ${count} pistas gratis de hoy. Mirá un anuncio para conseguir una más.`,
    later: 'Ahora no',
    watch: 'Ver anuncio',
    watching: 'Cargando anuncio…',
    unavailable: 'No hay anuncios disponibles ahora. Probá más tarde.',
    mockTitle: 'Anuncio de prueba',
    mockMessages: {
      extraHint: 'Anuncio simulado a cambio de una pista extra.',
      continueAfterLoss: 'Anuncio simulado para seguir con el mismo tablero.',
    } satisfies Record<RewardedPlacement, string>,
    mockFinish: 'Terminar de ver',
    mockClose: 'Cerrar sin terminar',
  },
  tips: [
    'Las pistas dicen cuántas celdas seguidas hay que rellenar. Empezá por las líneas con un 5.',
    'Si una pista y sus espacios ocupan toda la línea, la línea queda resuelta.',
    'Marcá con una X las celdas que seguro quedan vacías: te ayudan a deducir el resto.',
  ],
  pause: {
    title: 'Pausa',
    resume: 'Reanudar',
    restart: 'Reiniciar',
    abandon: 'Abandonar',
    settings: 'Ajustes',
    restartTitle: '¿Reiniciar el puzzle?',
    restartMessage: 'Se borra el tablero. El tiempo, los errores y las pistas usadas se mantienen.',
    abandonTitle: '¿Abandonar la partida?',
    abandonMessage: 'Se borra el progreso y contará como abandonada.',
  },
  lost: {
    title: 'Perdiste',
    message: (limit: number) =>
      `Cometiste ${limit} errores. Mirá un anuncio para seguir con este tablero o reintentá desde el principio.`,
    continue: 'Ver anuncio y seguir',
    retry: 'Reintentar',
    back: 'Volver',
  },
  victory: {
    title: '¡Resuelto!',
    newRecord: 'Nuevo récord',
    time: 'Tiempo',
    mistakes: 'Errores',
    hints: 'Pistas',
    difficulty: 'Dificultad',
    next: 'Siguiente puzzle',
    another: 'Otra igual',
    collection: 'Colección',
    home: 'Inicio',
  },
  stats: {
    title: 'Estadísticas',
    all: 'Todos',
    size: 'Tamaño',
    difficulty: 'Dificultad',
    started: 'Iniciadas',
    completed: 'Completadas',
    abandoned: 'Abandonadas',
    bestTime: 'Mejor tiempo',
    averageTime: 'Tiempo promedio',
    totalTime: 'Tiempo total',
    perfect: 'Perfectas',
    collection: 'Colección',
    collectionProgress: (size: string, completed: number, total: number) =>
      `${size}: ${completed} de ${total}`,
  },
  settings: {
    title: 'Ajustes',
    theme: 'Tema',
    themes: { system: 'Sistema', light: 'Claro', dark: 'Oscuro' } satisfies Record<Theme, string>,
    autoValidate: 'Validación automática',
    autoValidateHint: 'Corrige al instante las celdas rellenadas por error.',
    dimCompletedClues: 'Atenuar pistas completas',
    autoCross: 'Tachado automático',
    autoCrossHint: 'Marca con X el resto de una línea al completarla.',
    highlightLines: 'Resaltar fila y columna',
    showTimer: 'Mostrar temporizador',
    version: (version: string) => `Versión ${version}`,
    resetStats: 'Restablecer estadísticas',
    resetTitle: '¿Restablecer estadísticas?',
    resetMessage: 'Se borrarán todas tus estadísticas. No se puede deshacer.',
    resetConfirm: 'Restablecer',
  },
  howToPlay: {
    title: 'Cómo jugar',
    goal: 'Objetivo',
    goalText:
      'Rellená las celdas correctas para descubrir un dibujo oculto. Cada fila y cada columna tiene números que lo describen.',
    clues: 'Las pistas',
    cluesText:
      'Cada número es un bloque de celdas rellenas seguidas, en ese orden. Entre dos bloques hay al menos una celda vacía.',
    cluesExample: 'La pista "2 1" puede ser así:',
    tools: 'Herramientas',
    toolsText:
      'Rellenar pinta celdas; Marcar pone una X en las que seguro quedan vacías. Arrastrá para pintar varias en línea recta.',
    help: 'Ayudas',
    helpText:
      'Tenés 3 pistas gratis por día para todos los puzzles; después, cada pista extra se consigue mirando un anuncio. Con la validación automática, un error se corrige solo y suma al contador; con 3 errores perdés, y podés mirar un anuncio para seguir con el mismo tablero o reintentar.',
    start: 'Empezar el tutorial',
  },
} as const
