import normalizePCode from './util/normalizePCode.mjs';

export default [
  {
    fileName: 't1osa',
    features: [
      {
        feature: 'pcode8',
        columnNames: ['PCODE1t1', 'PCODE2t1', 'PCODE34t1', 'PCODE5t1', 'PCODE6t1', 'PCODE7t1', 'PCODE8t1'],
        normalizationFunction: (pcodeParts) => normalizePCode(pcodeParts.join('')),
      },
      {
        feature: 'Geburtsjahr',
        columnName: 'Altert1',
        normalizationFunction: (Altert1) => 2019 - +Altert1,
      },
      {
        feature: 'Gesch',
        columnName: 'Gescht1',
        normalizationFunction: (Gesch) => ({
          1: '0',
          2: '1',
          3: '2',
        }[Gesch] || Gesch),
      },
      {
        feature: 'Beginn',
        columnName: 'FSemBt1',
        normalizationFunction: (FSemBt1) => Math.round(2019.5 - 0.5 * +FSemBt1),
      },
      {
        feature: 'VBeginn',
        columnName: 'FSemBt1',
        normalizationFunction: (FSemBt1) => Math.round(2019.5 - 0.5 * +FSemBt1),
      },

      {
        feature: 'BaWue',
        columnName: 'BaWuet1',
      },

    ],
  },
  {
    fileName: 't2osa',
    features: [
      {
        feature: 'mat',
        columnName: 'Matt2',
      },
      {
        feature: 'pcode8',
        columnNames: ['PCODE1t2', 'PCODE2t2', 'PCODE34t2', 'PCODE5t2', 'PCODE6t2', 'PCODE7t2', 'PCODE8t2'],
        normalizationFunction: (pcodeParts) => normalizePCode(pcodeParts.join('')),
      },
      {
        feature: 'Geburtsjahr',
        columnName: 'Altert2',
        normalizationFunction: (Altert2) => 2020 - +Altert2,
      },
      {
        feature: 'Gesch',
        columnName: 'Gescht2',
        normalizationFunction: (Gesch) => ({
          1: '1',
          2: '0',
          3: '2',
        }[Gesch] || Gesch),
      },
      {
        feature: 'BLAbi',
        columnName: 'BLAbit2',
      },
      {
        feature: 'VBLAbi',
        columnName: 'BLAbit2',
      },
      {
        feature: 'NoteAbi',
        columnName: 'NoteAbit2',
      },
      {
        feature: 'VNoteAbi',
        columnName: 'NoteAbit2',
      },
      {
        feature: 'Beginn',
        columnName: 'FSemBt2',
        normalizationFunction: (FSemBt2) => Math.round(2020.5 - 0.5 * +FSemBt2),
      },
      {
        feature: 'VBeginn',
        columnName: 'FSemBt2',
        normalizationFunction: (FSemBt2) => Math.round(2020.5 - 0.5 * +FSemBt2),
      },
      {
        feature: 'BaWue',
        columnName: 'BaWuet2',
      },
    ],
  },
  {
    fileName: 't3osa',
    features: [
      {
        feature: 'mat',
        columnName: 'Matt3',
      },
      {
        feature: 'pcode10',
        columnNames: ['PCODE1t3', 'PCODE2t3', 'PCODE34t3', 'PCODE5t3', 'PCODE6t3', 'PCODE7t3', 'PCODE8t3', 'PCODE9t3', 'PCODE10t3'],
        normalizationFunction: (pcodeParts) => normalizePCode(pcodeParts.join('')),
      },
      {
        feature: 'pcode8',
        columnNames: ['PCODE1t3', 'PCODE2t3', 'PCODE34t3', 'PCODE5t3', 'PCODE6t3', 'PCODE7t3', 'PCODE8t3'],
        normalizationFunction: (pcodeParts) => normalizePCode(pcodeParts.join('')),
      },
      {
        feature: 'Geburtsjahr',
        columnName: 'Altert3',
        normalizationFunction: (Altert3) => 2021 - +Altert3,
      },
      {
        feature: 'Gesch',
        columnName: 'Gescht3',
        normalizationFunction: (Gesch) => ({
          1: '1',
          2: '0',
          3: '2',
        }[Gesch] || Gesch),
      },
      {
        feature: 'BLAbi',
        columnName: 'BLAbit3',
      },
      {
        feature: 'VBLAbi',
        columnName: 'BLAbit3',
      },
      {
        feature: 'NoteAbi',
        columnName: 'NoteAbit3',
      },
      {
        feature: 'VNoteAbi',
        columnName: 'NoteAbit3',
      },
      {
        feature: 'Beginn',
        columnName: 'FSemBt3',
        normalizationFunction: (FSemBt3) => Math.round(2021.5 - 0.5 * +FSemBt3),
      },
      {
        feature: 'VBeginn',
        columnName: 'FSemBt3',
        normalizationFunction: (FSemBt3) => Math.round(2021.5 - 0.5 * +FSemBt3),
      },
      {
        feature: 'BaWue',
        columnName: 'BaWuet3',
      },
    ],
  },
  {
    fileName: 't4osa',
    features: [
      {
        feature: 'mat',
        columnName: 'Matt4',
      },
      {
        feature: 'pcode10',
        columnNames: ['PCODE1t4', 'PCODE2t4', 'PCODE34t4', 'PCODE5t4', 'PCODE6t4', 'PCODE7t4', 'PCODE8t4', 'PCODE9t4', 'PCODE10t4'],
        normalizationFunction: (pcodeParts) => normalizePCode(pcodeParts.join('')),
      },
      {
        feature: 'pcode8',
        columnNames: ['PCODE1t4', 'PCODE2t4', 'PCODE34t4', 'PCODE5t4', 'PCODE6t4', 'PCODE7t4', 'PCODE8t4'],
        normalizationFunction: (pcodeParts) => normalizePCode(pcodeParts.join('')),
      },
      {
        feature: 'Geburtsjahr',
        columnName: 'Altert4',
        normalizationFunction: (Altert4) => 2022 - +Altert4,
      },
      {
        feature: 'Gesch',
        columnName: 'Gescht4',
        normalizationFunction: (Gesch) => ({
          1: '1',
          2: '0',
          3: '2',
        }[Gesch] || Gesch),
      },
      {
        feature: 'BLAbi',
        columnName: 'BLAbit4',
      },
      {
        feature: 'VBLAbi',
        columnName: 'BLAbit4',
      },
      {
        feature: 'NoteAbi',
        columnName: 'NoteAbit4',
      },
      {
        feature: 'VNoteAbi',
        columnName: 'NoteAbit4',
      },
      {
        feature: 'Beginn',
        columnName: 'FSemBt4',
        normalizationFunction: (FSemBt4) => Math.round(2022.5 - 0.5 * +FSemBt4),
      },
      {
        feature: 'VBeginn',
        columnName: 'FSemBt4',
        normalizationFunction: (FSemBt4) => Math.round(2022.5 - 0.5 * +FSemBt4),
      },
      {
        feature: 'BaWue',
        columnName: 'BaWuet4',
      },
    ],
  },
  {
    fileName: 'OSA_live_012',
    features: [
      {
        feature: 'pcode8',
        columnName: 'pcode',
        normalizationFunction: (pcode) => normalizePCode(pcode),
      },
      {
        feature: 'Geburtsjahr',
        columnNames: ['Alter', 'osaStart'],
        normalizationFunction: ([Alter, osaStart]) => +/\d{4}/.exec(osaStart) - +Alter,
      },
      {
        feature: 'Gesch',
        columnName: 'Gesch',
      },
      {
        feature: 'VBLAbi',
        columnName: 'LandHZB',
      },
      {
        feature: 'VNoteAbi',
        columnName: 'Abiturnote',
      },
      {
        feature: 'VBeginn',
        columnName: 'Beginn',
      },
      {
        feature: 'FBeginn',
        columnName: 'modified',
        normalizationFunction: (value) => {
          const [, month, year] = /\d{2}\.(\d{2})\.(\d{4})/.exec(value);
          return +year + (+month >= 11 ? 1 : 0);
        },
      },
    ],
    groups: [
      {
        name: 'ElTestOSALive012',
        begin: 'Kli1CRE',
        end: 'EFal6',
        exclude: (columnName) => /COR$/.test(columnName),
      },
      {
        name: 'FTestOSALive012',
        begin: 'q1CRE',
        end: 'v6VAL',
        exclude: (columnName) => /COR$/.test(columnName),
      },
    ],
  },
  {
    fileName: 'OSA_live_3',
    features: [
      {
        feature: 'pcode10',
        columnName: 'pcode',
        normalizationFunction: (pcode) => normalizePCode(pcode),
      },
      {
        feature: 'pcode8',
        columnName: 'pcode',
        normalizationFunction: (pcode) => normalizePCode(pcode).substring(0, 8),
      },
      {
        feature: 'Geburtsjahr',
        columnNames: ['Alter', 'osaStart'],
        normalizationFunction: ([Alter, osaStart]) => +/\d{4}/.exec(osaStart) - +Alter,
      },
      {
        feature: 'Gesch',
        columnName: 'Gesch',
      },
      {
        feature: 'VBLAbi',
        columnName: 'LandHZB',
      },
      {
        feature: 'VNoteAbi',
        columnName: 'Abiturnote',
      },
      {
        feature: 'VBeginn',
        columnName: 'Beginn',
      },
      {
        feature: 'FBeginn',
        columnName: 'modified',
        normalizationFunction: (value) => {
          const [, month, year] = /\d{2}\.(\d{2})\.(\d{4})/.exec(value);
          return +year + (+month >= 11 ? 1 : 0);
        },
      },
    ],
    groups: [
      {
        name: 'ElTestOSALive3',
        begin: 'Kli1CRE',
        end: 'EFal6',
        exclude: (columnName) => /COR$/.test(columnName),
      },
      {
        name: 'FTestOSALive3',
        begin: 'FNum1CRE',
        end: 'FFig3VAL',
        exclude: (columnName) => /COR$/.test(columnName),
      },
    ],
  },
  {
    fileName: 'leistung',
    features: [
      {
        feature: 'pcode8',
        columnName: 'PCODE',
      },
      {
        feature: 'Beginn',
        columnNames: ['aktuellesSemester', 'Fachsemester'],
        normalizationFunction: ([currentSemester, semester]) => {
          const [, year, halfYear] = currentSemester.match(/(\d{4})(\d)/);
          const parsedYear = +year + (+halfYear - 1) * 0.5;
          return Math.round(parsedYear - 0.5 * +semester);
        },
      },
      {
        feature: 'VBeginn',
        columnNames: ['aktuellesSemester', 'Fachsemester'],
        normalizationFunction: ([currentSemester, semester]) => {
          const [, year, halfYear] = currentSemester.match(/(\d{4})(\d)/);
          const parsedYear = +year + (+halfYear - 1) * 0.5;
          return Math.round(parsedYear - 0.5 * +semester);
        },
      },
      {
        feature: 'BaWue',
        columnName: 'Universität',
        normalizationFunction: (BaWue) => ({
          1: '1',
          2: '3',
          3: '5',
          4: '2',
          5: '6',
        }[BaWue] || BaWue),
      },
    ],
  },
];
