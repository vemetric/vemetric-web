import styles from './page.module.css';
import PageContent from '@/components/page-content';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Vemetric Next.js Example</h1>
        <PageContent />
      </main>
    </div>
  );
}
