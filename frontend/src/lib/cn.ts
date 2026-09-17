/**
 * Concatene des classes conditionnelles sans dependance externe.
 * Accepte n'importe quelle valeur : seules les chaines non vides sont
 * conservees, ce qui rend sur l'idiome `condition && 'classe'` meme quand
 * la condition est un ReactNode pouvant valoir 0 ou "".
 */
export function cn(...values: unknown[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value !== '').join(' ')
}
