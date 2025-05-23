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
    onReload,
    onDeleteMultiple,
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
            onReload={onReload}
            currentPage={currentPage}
            totalMails={totalMails}
            onToggleRead={onToggleRead}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onRestoreSelected={onRestoreSelected}
            onDeleteMultiple={onDeleteMultiple}
        />
        <div className="mailContentWrapper">
          {children}
        </div>
      </div>
    );
  }
  