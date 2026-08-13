/*
 * author-bio — WKND magazine-article author block.
 * Appears at the end of a magazine article: a thin rule, then a horizontal row
 * of the author avatar, name + role(s), and social icons in a dark box on the
 * right. Matches the source .cmp-teaser byline card.
 *
 * Authored structure (rows), avatar optional:
 *   row A (optional) -> avatar image (a picture/img cell)
 *   row 1 -> name        (e.g. "Jacob Wester")
 *   row 2 -> role(s)     (e.g. "Skater, Writer")
 *   row 3 -> social link | social link | social link  (optional)
 *
 * @param {Element} block the .author-bio block element
 */

// Inline SVG glyphs for social platforms, matching the footer block. The source
// uses an icon font (wknd-icon-font) not available in EDS, so the plain-text
// social links are swapped for these marks here.
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.47-4.05 4.17v2.33H7.8V13h2.7v8h3z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22 5.9c-.7.32-1.5.53-2.3.63.83-.5 1.46-1.28 1.76-2.22-.78.46-1.63.8-2.55.98A4.02 4.02 0 0 0 12 8.9c0 .32.03.62.1.92-3.34-.17-6.3-1.77-8.28-4.2-.35.6-.55 1.28-.55 2.02 0 1.4.71 2.63 1.79 3.35-.66-.02-1.28-.2-1.82-.5v.05c0 1.95 1.38 3.57 3.22 3.94-.34.09-.7.14-1.06.14-.26 0-.5-.03-.75-.07.51 1.6 2 2.76 3.75 2.79A8.06 8.06 0 0 1 2 18.28 11.37 11.37 0 0 0 8.16 20c7.4 0 11.44-6.13 11.44-11.44v-.52c.78-.57 1.46-1.28 2-2.09z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 4.55c2.4 0 2.68.01 3.63.05.88.04 1.35.19 1.67.31.42.16.72.36 1.03.67.31.31.51.61.67 1.03.12.32.27.79.31 1.67.04.95.05 1.23.05 3.63s-.01 2.68-.05 3.63c-.04.88-.19 1.35-.31 1.67-.16.42-.36.72-.67 1.03-.31.31-.61.51-1.03.67-.32.12-.79.27-1.67.31-.95.04-1.23.05-3.63.05s-2.68-.01-3.63-.05c-.88-.04-1.35-.19-1.67-.31a2.78 2.78 0 0 1-1.03-.67 2.78 2.78 0 0 1-.67-1.03c-.12-.32-.27-.79-.31-1.67-.04-.95-.05-1.23-.05-3.63s.01-2.68.05-3.63c.04-.88.19-1.35.31-1.67.16-.42.36-.72.67-1.03.31-.31.61-.51 1.03-.67.32-.12.79-.27 1.67-.31.95-.04 1.23-.05 3.63-.05M12 3c-2.44 0-2.75.01-3.71.05-.96.04-1.61.2-2.19.42-.6.23-1.1.54-1.61 1.05-.51.51-.82 1.01-1.05 1.61-.22.58-.38 1.23-.42 2.19C3 9.25 3 9.56 3 12s.01 2.75.05 3.71c.04.96.2 1.61.42 2.19.23.6.54 1.1 1.05 1.61.51.51 1.01.82 1.61 1.05.58.22 1.23.38 2.19.42.96.04 1.27.05 3.71.05s2.75-.01 3.71-.05c.96-.04 1.61-.2 2.19-.42.6-.23 1.1-.54 1.61-1.05.51-.51.82-1.01 1.05-1.61.22-.58.38-1.23.42-2.19.04-.96.05-1.27.05-3.71s-.01-2.75-.05-3.71c-.04-.96-.2-1.61-.42-2.19a4.33 4.33 0 0 0-1.05-1.61 4.33 4.33 0 0 0-1.61-1.05c-.58-.22-1.23-.38-2.19-.42C14.75 3 14.44 3 12 3zm0 4.38A4.62 4.62 0 1 0 16.62 12 4.62 4.62 0 0 0 12 7.38zm0 7.62A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm4.8-8.88a1.08 1.08 0 1 0 1.08 1.08 1.08 1.08 0 0 0-1.08-1.08z"/></svg>',
};

/** Detect a social platform key from a link's href/text. */
function socialKey(a) {
  const s = `${a.getAttribute('href') || ''} ${a.textContent}`.toLowerCase();
  if (s.includes('facebook')) return 'facebook';
  if (s.includes('twitter')) return 'twitter';
  if (s.includes('instagram')) return 'instagram';
  return null;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Split rows into: an optional avatar row (contains a picture/img), the
  // socials row (contains links), and the text rows (name, role) in between.
  const avatarRow = rows.find((r) => r.querySelector('picture, img'));
  const socialsRow = rows.find((r) => r.querySelector('a'));
  const textRows = rows.filter((r) => r !== avatarRow && r !== socialsRow);

  // --- Avatar (optional) ---
  let avatar = null;
  if (avatarRow) {
    const pic = avatarRow.querySelector('picture') || avatarRow.querySelector('img');
    avatar = document.createElement('div');
    avatar.className = 'author-bio-avatar';
    avatar.append(pic);
  }

  // --- Name + role text column ---
  const info = document.createElement('div');
  info.className = 'author-bio-info';
  const [nameRow, roleRow] = textRows;
  const nameCell = nameRow?.querySelector(':scope > div') || nameRow;
  if (nameCell) {
    const h2 = document.createElement('h2');
    h2.className = 'author-bio-name';
    h2.textContent = nameCell.textContent.trim();
    info.append(h2);
  }
  if (roleRow) {
    const p = document.createElement('p');
    p.className = 'author-bio-role';
    p.textContent = roleRow.textContent.trim();
    info.append(p);
  }

  // --- Social icons (dark box, right) ---
  let socials = null;
  if (socialsRow) {
    socials = document.createElement('div');
    socials.className = 'author-bio-socials';
    socialsRow.querySelectorAll('a').forEach((a) => {
      a.classList.add('author-bio-social');
      const key = socialKey(a);
      if (key) {
        a.setAttribute('aria-label', a.textContent.trim());
        a.innerHTML = SOCIAL_ICONS[key];
      }
      socials.append(a);
    });
  }

  // --- Rebuild as a single horizontal row ---
  block.textContent = '';
  if (avatar) block.append(avatar);
  block.append(info);
  if (socials) block.append(socials);
}
