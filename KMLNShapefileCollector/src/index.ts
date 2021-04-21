import strsim from 'string-similarity';
import { dialog } from 'electron';

console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))

console.log(2);