export const manifestoContent = {
  // Título grande del manifiesto. El span "accent" se renderiza en rojo.
  headline: {
    main: 'Patinamos, comemos pizza, y volvemos a empezar.',
    accent: 'Punto.',
  },

  // Párrafos del manifiesto (texto plano, separados)
  paragraphs: [
    'Fugazzesions nació en una sesión cualquiera de patín que terminó con una fugazzeta compartida en la vereda. Lo que arrancó como una excusa entre amigos se fue armando de a poco: más patinadores, más rampas, más pizza.',
    // El segundo párrafo usa <strong> para resaltar la frase clave
    'Hoy somos una comunidad que cree en lo simple. <strong>Pizza, patín y punto.</strong> Sin pretensiones, sin barreras, sin ego. Si patinás (o querés aprender), este es tu lugar.',
  ],

  // Quote destacada del costado
  quote: {
    text: 'El patín no es un deporte, es una forma de salir a la calle.',
    sig: 'Manifiesto Fugazzesions',
  },
};

export type ValueVariant = 'default' | 'red' | 'green';

export const valuesContent: Array<{
  num: string;
  icon: string; // nombre del ícono de lucide
  title: string;
  text: string;
  variant: ValueVariant;
}> = [
  {
    num: '01',
    icon: 'Flame',
    title: 'Comunidad antes que ego',
    text: 'Acá no hay niveles, hay patinadores. Si recién empezás o si llevás veinte años, rodás con nosotros igual.',
    variant: 'red',
  },
  {
    num: '02',
    icon: 'Pizza',
    title: 'El ritual de la pizza',
    text: 'Toda sesión termina con una pizza. No es un detalle, es la regla. Lo que se comparte en la mesa vale tanto como lo que pasa en la rampa.',
    variant: 'default',
  },
  {
    num: '03',
    icon: 'Asterisk',
    title: 'Quad e inline, sin grietas',
    text: 'Cuatro ruedas o en línea, la onda es la misma. Acá nadie está en bandos, todos somos patín.',
    variant: 'green',
  },
];

export const foundersContent = [
  {
    name: 'Nombre 1',
    role: 'Fundador',
  },
  {
    name: 'Nombre 2',
    role: 'Fundador',
  },
  {
    name: 'Nombre 3',
    role: 'Fundador',
  },
];

export const collaboratorsContent = {
  title: 'Y toda la banda',
  accent: 'la banda',
  text: 'Nada de esto funciona sin la gente que siempre aparece a tirar una mano: amigos que filman, que arman las rampas, que llevan la pizza, que aguantan el día entero.',
  footnote: 'Ustedes también son Fugazzesions.',
};