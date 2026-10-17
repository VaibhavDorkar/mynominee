import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';

type AssetCategory = { icon: string; title: string; subtitle: string; detail: string; tag: string };
type Faq = { question: string; answer: string };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  activeSectionId = 'problem';
  private sectionObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) this.activeSectionId = visible.target.id;
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.35, 0.6] });
    this.navItems.forEach(item => {
      const section = document.getElementById(item.href.slice(1));
      if (section) this.sectionObserver?.observe(section);
    });
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }
  readonly currentYear = new Date().getFullYear();
  menuOpen = false;
  assessmentOpen = false;
  assessmentStep = 0;
  assessmentAnswers: number[] = [];
  assessmentComplete = false;
  activeFaq = 0;
  activeCategory: AssetCategory | null = null;
  readonly categories: AssetCategory[] = [
    { icon: '▤', title: 'Bank accounts & deposits', subtitle: 'Savings, FDs and recurring deposits', detail: 'Keep account locations, nominee status and the documents your family may need in one organized checklist.', tag: 'BANKING' },
    { icon: '♡', title: 'Life & health insurance', subtitle: 'Policies, cover and claim details', detail: 'Record policy providers, policy references, nominee information and where supporting documents are kept.', tag: 'INSURANCE' },
    { icon: '↗', title: 'Mutual funds & investments', subtitle: 'Folios, SIPs and investment accounts', detail: 'Create a clear inventory of investment providers and folios, then review nominee details with the relevant institution.', tag: 'INVESTMENTS' },
    { icon: '▥', title: 'Demat & securities', subtitle: 'Shares, bonds and depository accounts', detail: 'Document depository participants and account references, and check the current nomination process with your provider.', tag: 'SECURITIES' },
    { icon: '◷', title: 'Retirement & pensions', subtitle: 'EPF, PPF, NPS and gratuity', detail: 'Bring retirement-account references and nomination-review reminders together for easier family preparedness.', tag: 'RETIREMENT' },
    { icon: '⌂', title: 'Property & valuables', subtitle: 'Property records, lockers and important papers', detail: 'Note where key documents are stored and which institution or professional can explain the applicable process.', tag: 'PROPERTY' }
  ];
  readonly faqs: Faq[] = [
    { question: 'What is MyNominee.In?', answer: 'MyNominee.In is designed to help families organize awareness and information about financial assets, nominee details and important records, so the next steps are easier to understand.' },
    { question: 'Does adding information here replace official nomination?', answer: 'No. An organizer or record is not a substitute for completing the official nomination process with a bank, insurer, investment provider, depository or other institution.' },
    { question: 'Do I need to share passwords or OTPs?', answer: 'Never share passwords, OTPs, PINs or full login credentials. Use official institution channels for sensitive account actions.' },
    { question: 'Can I use this page without creating an account?', answer: 'Yes. This guest page is informational and works without an account, backend or database.' },
    { question: 'What should my family keep ready?', answer: 'Start with a list of institutions, account or policy references, nominee details, contact information and the location of relevant documents. Confirm the exact requirements with the institution.' }
  ];
  readonly questions = [
    'Have you made a list of your financial accounts and policies?',
    'Do you know who is currently nominated across those accounts?',
    'Would your family know where to find the important documents?',
    'Have you reviewed these details in the last 12 months?'
  ];
  readonly navItems = [
    { label: 'Problem', href: '#problem' },
    { label: 'Solution', href: '#solution' },
    { label: 'Assets', href: '#assets' },
    { label: 'Resources', href: '#resources' },
    { label: 'Unclaimed amounts', href: '#unclaimed-amounts' },
    { label: 'Contact us', href: '#contact' }
  ];

  scrollTo(id: string): void {
    this.menuOpen = false;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  openAssessment(): void {
    this.assessmentOpen = true;
    this.assessmentStep = 0;
    this.assessmentAnswers = [];
    this.assessmentComplete = false;
  }
  answerAssessment(answer: number): void {
    this.assessmentAnswers[this.assessmentStep] = answer;
    if (this.assessmentStep < this.questions.length - 1) this.assessmentStep++;
    else this.assessmentComplete = true;
  }
  get assessmentScore(): number {
    return this.assessmentAnswers.filter(value => value === 1).length;
  }
  closeAssessment(): void { this.assessmentOpen = false; }
  toggleFaq(index: number): void { this.activeFaq = this.activeFaq === index ? -1 : index; }
  selectCategory(category: AssetCategory): void { this.activeCategory = category; }
  closeCategory(): void { this.activeCategory = null; }
}
