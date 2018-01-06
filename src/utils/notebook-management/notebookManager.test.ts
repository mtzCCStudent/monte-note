jest.mock('../dbMessager');
jest.mock('fs');
import NotebookManager from './notebookManager';
import { DbMessager } from '../dbMessager';

let notebookManager: NotebookManager;
let testNotebook = 'chemistry';
beforeAll(done => {
  // Set notebook directory location as current working directory
  notebookManager = new NotebookManager();
  notebookManager.setNotebooksLocation(process.cwd() + '\\testing')
  .then(() => {
    done();
  });

});

beforeEach(() => {
  const NOTEBOOK_LIST = [testNotebook, testNotebook];
  require('fs').__setNotebookList(NOTEBOOK_LIST);
});

test('gets notebook directory location', done => {

    notebookManager.getNotebooksLocation()
    .then(result => {
      done();
      expect(result).toEqual(process.cwd() + '\\testing');
    });

});

test('creates notebook', done => {
  notebookManager.addNotebook(testNotebook)
  .then(() => {
    done();
    expect(notebookManager.notebooks).toContain(testNotebook);
  });
});

test('deletes a notebook', () => {
  notebookManager.deleteNotebook(testNotebook);

  expect(notebookManager.notebooks).not.toContain(testNotebook);
});

test('deletes all notebooks', () => {
  notebookManager.addNotebook(testNotebook + '-industrial');
  notebookManager.addNotebook(testNotebook + '-biology');
  notebookManager.addNotebook(testNotebook + '-organic');

  notebookManager.deleteEverything();

  expect(notebookManager.notebooks).toHaveLength(0);
});

test('gets all notebooks inside notebooks location directory', () => {
  notebookManager.addNotebook(testNotebook + '-lalaland');
  notebookManager.addNotebook(testNotebook + '-blam');

  expect(notebookManager.getNotebooks()).toHaveLength(2);
});

test('loads all existing notebooks into the db', done => {
  let dbMessager = new DbMessager();
  notebookManager.loadExistingNotebooksIntoApp()
  .then(() => {
    let notebooks = dbMessager.getNotebooks();
    expect(notebooks).toHaveLength(2);
    done();
  });
});

test('returns all existing notebooks in chosen dir', () => {
  let dir = 'test-dir';
  let result = NotebookManager.getNotebooks(dir);
  expect(result).toHaveLength(2);
});

test('creates note page file', done => {
  let locationToNotebook = 'C:\\test-dir\\test-notebook';
  NotebookManager.addNote(locationToNotebook, 'test-note-page')
  .then((result: boolean) => {
    done();
    expect(result).toEqual(true);
  });
});

test('gets all note files in a directory of a notebook', done => {
  let notebookLocation = 'C:\\notebooks\\test-nbook-1';
  NotebookManager.getNotes(notebookLocation)
  .then((notes: string[]) => {
    done();
    expect(notes).toHaveLength(2);
  });
});

test('gets created date for files in array', done => {
  let notebookLocation = 'C:\\notebooks\\test-nbook-1';
  let notes = ['note-1.html', 'note-2.html', 'note-3.html', 'note-4.html'];

  NotebookManager.getNotesCreationDate(notebookLocation, notes)
  .then((result: any) => {
    done();
    expect(result[notes[0]]).toHaveProperty('created_at');
  });
});

test('sorts notebooks object by a property value that we specify', () => {
  let notesObj = {
    'biggie.html': {'created_at' : '2018-01-03T20:48:45.829Z'},
    'bureks.html' : {'created_at' : '2018-01-03T20:58:53.438Z'},
    'coffee.html' : {'created_at' : '2018-01-03T19:27:05.350Z'},
    'fishie-2.html' : {'created_at' : '2018-01-04T11:40:56.495Z'},
    'fishies.html' : {'created_at' : '2018-01-03T20:58:47.675Z'}
  };

  let result = NotebookManager.orderNotesBy(notesObj, 'created_at');

  expect(result[4]).toEqual('fishie-2.html');
});

test('removes .html extension from note filename', () => {
  let result = NotebookManager.formatNoteName('fishie-2.html');

  expect(result).toEqual('fishie-2');
});

test('pretty formats note list', () => {
  let notes = ['fishie-2.html', 'coffee.html', 'bikes.html'];

  let result = NotebookManager.formatNotes(notes);

  expect(result).toEqual(['fishie-2', 'coffee', 'bikes']);
});

test('writes data to note', done => {
  let absolutePathToNote = 'C:\\notebooks\\test-nbook-1\\testNote.html';
  let noteData = '<h1>Test Content</h1>';

  NotebookManager.updateNoteData(absolutePathToNote, noteData)
  .then((result: boolean) => {
    done();
    expect(result).toEqual(true);
  });

});

test('gets data from note', done => {
  let absolutePathToNote = 'C:\\notebooks\\test-nbook-1\\testNote.html';

  NotebookManager.getNoteData(absolutePathToNote)
  .then((result: string) => {
    done();
    expect(result).toBeTruthy();
  });
});

afterEach(() => {
  notebookManager.deleteEverything();
});
