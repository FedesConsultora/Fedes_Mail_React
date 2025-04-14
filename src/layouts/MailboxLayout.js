import React from "react";
import SearchAndFilters from "../components/SearchAndFilters/SearchAndFilters";
import InboxToolbar from "../components/InboxToolbar";


export default function MailboxLayout({
    children,
    allSelected,
    someSelected,
    onSelectAll,
    onMarkAllRead,
    selected,
    currentPage,
    totalMails,
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
            currentPage={currentPage}
            totalMails={totalMails}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
        />
        <div className="mailContentWrapper">
          {children}
        </div>
      </div>
    );
  }
  