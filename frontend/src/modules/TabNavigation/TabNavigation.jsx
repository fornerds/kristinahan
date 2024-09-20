import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './TabNavigation.module.css';
import { ReactComponent as UserIcon } from '../../asset/icon/user.svg'
import { ReactComponent as GlobeIcon } from '../../asset/icon/globe.svg'
import { ReactComponent as OrderIcon } from '../../asset/icon/order.svg'
import { ReactComponent as ProductIcon } from '../../asset/icon/product.svg'
import { ReactComponent as OrderFormIcon } from '../../asset/icon/order_form.svg'
import { ReactComponent as EventIcon } from '../../asset/icon/event.svg'
import { ReactComponent as LockIcon } from '../../asset/icon/lock.svg'

export const TabNavigation = () => {
  const getNavLinkClass = ({ isActive }) => 
    `${styles.tab} ${isActive ? styles.activeTab : ''}`;

  const getIconColor = (isActive) => 
    isActive ? '#4069e5' : '#333';

  return (
    <nav className={styles.tabNavigation}>
      <NavLink to="/admin/writer" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <UserIcon className={styles.icon} fill={getIconColor(isActive)} />
            작성자 관리
          </>
        )}
      </NavLink>
      <NavLink to="/admin/affiliation" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <GlobeIcon className={styles.icon} fill={getIconColor(isActive)} />
            소속 관리
          </>
        )}
      </NavLink>
      <NavLink to="/admin/order" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <OrderIcon className={styles.icon} fill={getIconColor(isActive)} />
            주문서 목록
          </>
        )}
      </NavLink>
      <NavLink to="/admin/orderform" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <OrderFormIcon className={styles.icon} fill={getIconColor(isActive)} />
            주문서 양식 관리
          </>
        )}
      </NavLink>
      <NavLink to="/admin/product" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <ProductIcon className={styles.icon} fill={getIconColor(isActive)} />
            상품 관리
          </>
        )}
      </NavLink>
      <NavLink to="/admin/event" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <EventIcon className={styles.icon} stroke={getIconColor(isActive)} />
            행사 관리
          </>
        )}
      </NavLink>
      <NavLink to="/admin/password" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            <LockIcon className={styles.icon} fill={getIconColor(isActive)} />
            비밀번호 관리
          </>
        )}
      </NavLink>
    </nav>
  );
};