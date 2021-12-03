import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import { useQuery } from "@apollo/client";
import { Col, Layout, Row } from "antd";
import { ErrorBanner } from "../../lib/components/ErrorBanner";
import { PageSkeleton } from "../../lib/components/PageSkeleton";
import { LISTING } from "../../lib/graphql/queries";
import {
  Listing as ListingData,
  ListingVariables,
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import { ListingDetails, ListingBookings } from "./components";

interface MatchParams {
  id: string;
}

export const Listing = ({ match }: RouteComponentProps<MatchParams>) => {
  const { Content } = Layout;
  const PAGE_LIMIT = 3;
  const [bookingsPage, setBookingsPage] = useState<number>(1);
  const { data, error, loading } = useQuery<ListingData, ListingVariables>(
    LISTING,
    {
      variables: {
        id: match.params.id,
        bookingsPage: bookingsPage,
        limit: PAGE_LIMIT,
      },
    }
  );

  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;

  const listingDetailsElement = listing ? (
    <ListingDetails listing={listing} />
  ) : null;

  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon!" />
        <PageSkeleton />
      </Content>
    );
  }

  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};
