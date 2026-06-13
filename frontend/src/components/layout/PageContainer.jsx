import React from 'react';
import TopNavbar from './TopNavbar';
import Header from './Header';
import './PageContainer.css';

const PageContainer = ({ children, title, showHeader = true }) => {
  return (
    <div className="page-wrapper">
      <TopNavbar />
      <div className="main-wrapper">
        {showHeader && <Header title={title} />}
        <main className="main-content">
          <div className="content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageContainer;
