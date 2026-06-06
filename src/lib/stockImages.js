// Professionelle Platzhalter-Bilder pro Branche (Unsplash – kostenlos, lizenzfrei)
// Werden bei der Generierung eingesetzt, damit das Template fertig aussieht.
// Im Editor durch eigene oder KI-Bilder ersetzbar.

// Kuratiertе Unsplash-Foto-IDs pro Branche (fest, damit immer dasselbe gute Bild kommt)
const STOCK = {
  restaurant: ['photo-1517248135467-4c7edcad34c4', 'photo-1414235077428-338989a2e8c0', 'photo-1551782450-a2132b4ba21d', 'photo-1424847651672-bf20a4b0982b', 'photo-1559339352-11d035aa65de', 'photo-1546069901-ba9599a7e63c'],
  salon: ['photo-1560066984-138dadb4c035', 'photo-1521590832167-7bcbfaa6381f', 'photo-1522337660859-02fbefca4702', 'photo-1487412947147-5cebf100ffc2', 'photo-1595476108010-b4d1f102b1b1', 'photo-1580618672591-eb180b1a973f'],
  fitness: ['photo-1534438327276-14e5300c3a48', 'photo-1571019613454-1cb2f99b2d8b', 'photo-1517836357463-d25dfeac3438', 'photo-1540497077202-7c8a3999166f', 'photo-1581009146145-b5ef050c2e1e', 'photo-1518611012118-696072aa579a'],
  anwalt: ['photo-1589829545856-d10d557cf95f', 'photo-1505664194779-8beaceb93744', 'photo-1521791136064-7986c2920216', 'photo-1450101499163-c8848c66ca85', 'photo-1423592707957-3b212afa6733', 'photo-1556761175-5973dc0f32e7'],
  praxis: ['photo-1576091160550-2173dba999ef', 'photo-1631217868264-e5b90bb7e133', 'photo-1519494026892-80bbd2d6fd0d', 'photo-1666214280557-f1b5022eb634', 'photo-1538108149393-fbbd81895907', 'photo-1551601651-2a8555f1a136'],
  handwerk: ['photo-1504307651254-35680f356dfd', 'photo-1581092160562-40aa08e78837', 'photo-1572981779307-38b8cabb2407', 'photo-1556911220-bff31c812dba', 'photo-1621905251189-08b45d6a269e', 'photo-1503387762-592deb58ef4e'],
  immobilien: ['photo-1560518883-ce09059eeffa', 'photo-1564013799919-ab600027ffc6', 'photo-1568605114967-8130f3a36994', 'photo-1570129477492-45c003edd2be', 'photo-1512917774080-9991f1c4c750', 'photo-1600596542815-ffad4c1539a9'],
  agentur: ['photo-1497366754035-f200968a6e72', 'photo-1522071820081-009f0129c71c', 'photo-1531973576160-7125cd663d86', 'photo-1542744173-8e7e53415bb0', 'photo-1556761175-b413da4baf72', 'photo-1600880292203-757bb62b4baf'],
  fahrschule: ['photo-1449965408869-eaa3f722e40d', 'photo-1502877338535-766e1452684a', 'photo-1492144534655-ae79c964c9d7', 'photo-1503376780353-7e6692767b70', 'photo-1494976388531-d1058494cdd8', 'photo-1568605117036-5fe5e7bab0b7'],
  andere: ['photo-1497366216548-37526070297c', 'photo-1556761175-b413da4baf72', 'photo-1497366811353-6870744d04b2', 'photo-1542744173-8e7e53415bb0', 'photo-1486406146926-c627a92ad1ab', 'photo-1600880292203-757bb62b4baf'],
}

function url(id, w = 1200, h = 800) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`
}

export function getStockImages(branche) {
  const ids = STOCK[branche] || STOCK.andere
  return {
    hero: url(ids[0], 1400, 900),
    about: url(ids[1], 1200, 800),
    gallery: ids.map(id => url(id, 800, 600)),
    list: ids.map(id => url(id, 800, 600)),
  }
}
