import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Site } from '../src/site/Site';
import { loadBundledContent } from '../src/content';

const content = loadBundledContent();

describe('<Site />', () => {
  it('renders every section anchor and the header nav', () => {
    const { container } = render(<Site content={content} />);
    for (const id of ['about', 'audiences', 'accommodation', 'seasons', 'activities', 'transport', 'faq']) {
      expect(container.querySelector(`#${id}`), `section #${id}`).not.toBeNull();
    }
    for (const item of content.site.nav) {
      expect(screen.getAllByText(item.label).length).toBeGreaterThan(0);
    }
    expect(screen.getByText('製作者：黃政文')).toBeInTheDocument();
  });

  it('renders all room cards and opens the room modal with the equipment list', () => {
    render(<Site content={content} />);
    for (const room of content.rooms.cards) expect(screen.getAllByText(room.name).length).toBeGreaterThan(0);

    const first = content.rooms.cards[0];
    const detailButtons = screen.getAllByRole('button', { name: content.rooms.labels.detailButton });
    expect(detailButtons).toHaveLength(content.rooms.cards.length);
    fireEvent.click(detailButtons[0]);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(`${first.name}${content.rooms.labels.modalTitleSuffix}`)).toBeInTheDocument();
    expect(within(dialog).getByText(first.equipment[0])).toBeInTheDocument();
    fireEvent.click(within(dialog).getAllByRole('button', { name: content.rooms.labels.modalClose })[0]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('switches FAQ categories and toggles answers', () => {
    render(<Site content={content} />);
    const [firstCat, secondCat] = content.faq.categories;
    // Accessible name is `${question} +` / `${question} −`, so match on the prefix.
    const byQuestion = (q: string) => (name: string) => name.startsWith(q);
    // First answer starts expanded, second collapsed.
    const q1 = screen.getByRole('button', { name: byQuestion(firstCat.faqs[0].q) });
    const q2 = screen.getByRole('button', { name: byQuestion(firstCat.faqs[1].q) });
    expect(q1).toHaveAttribute('aria-expanded', 'true');
    expect(q2).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(q2);
    expect(q2).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(q1);
    expect(q1).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: `${secondCat.icon} ${secondCat.id}｜${secondCat.title}` }));
    expect(screen.getByRole('button', { name: byQuestion(secondCat.faqs[0].q) })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: byQuestion(firstCat.faqs[0].q) })).toBeNull();
  });

  it('opens the EDM modal from an edm link', () => {
    render(<Site content={content} />);
    const edmButtons = screen.getAllByRole('button', { name: content.audiences.cards[1].button.label });
    fireEvent.click(edmButtons[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(content.edm.items[0].title, { exact: false })).toBeInTheDocument();
  });

  it('renders shared links with the configured urls', () => {
    render(<Site content={content} />);
    const lineLinks = screen.getAllByRole('link', { name: content.site.headerButtons.line.label });
    expect(lineLinks[0]).toHaveAttribute('href', content.site.links.line.url);
  });
});
