import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={`${commonStyles.container1120} ${styles.headerContainer}`}>
      <div className={commonStyles.container720}>
        <Link href="/">
          <a>
            <img src="/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  )
}
