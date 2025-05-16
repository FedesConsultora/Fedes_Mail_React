import React from "react";
import SearchAndFilters from "../components/SearchAndFilters/SearchAndFilters";
import InboxToolbar from "../components/InboxToolbar";


export default function MailboxLayout({
    children,
    allSelected,
    someSelected,
    onSelectAll,
    onMarkAllRead,
    onToggleRead,
    selected,
    isRead, 
    currentPage,
    totalMails,
    onRestoreSelected,
    onPrevPage,
    onNextPage
  }) {
    return (
      <div className="inboxContainer">
        <SearchAndFilters />
        <InboxToolbar
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={onSelectAll}
            onMarkAllRead={onMarkAllRead}
            selected={selected}
            isRead={isRead}  
            currentPage={currentPage}
            totalMails={totalMails}
            onToggleRead={onToggleRead}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onRestoreSelected={onRestoreSelected}
        />
        <div className="mailContentWrapper">
          {children}
        </div>
      </div>
    );
  }
  