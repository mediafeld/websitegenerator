// Pflichtangaben für Rechnung & Impressum.
//
// WICHTIG: Diese Datei hat BEWUSST kein 'use client'. Sie wird sowohl vom
// Browser (Konto-Seite) als auch vom Server (/api/checkout) benutzt.
// Vorher lagen diese Funktionen in lib/projekte.js — die ist 'use client',
// dadurch bekam die Server-Route beim Import nur einen Platzhalter statt der
// echten Funktion und der Checkout brach mit "m is not a function" ab.

export const PROFIL_PFLICHTFELDER = [
  ['vorname', 'Vorname'],
  ['nachname', 'Nachname'],
  ['strasse', 'Straße & Hausnummer'],
  ['plz', 'Postleitzahl'],
  ['ort', 'Ort'],
]

export function profilLuecken(profil) {
  return PROFIL_PFLICHTFELDER.filter(([feld]) => !profil?.[feld]?.trim?.()).map(([, label]) => label)
}
