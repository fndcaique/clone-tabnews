import { somar } from '../models/calculadora';

test('somar 2 + 2 deveria retornar 4', () => {
  expect(somar(2, 2)).toBe(4);
});
