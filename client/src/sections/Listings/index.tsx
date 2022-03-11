import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";
import { Affix, Layout, List, Typography } from "antd";
import { ErrorBanner, ListingCard } from "../../lib/components";
import {
  ListingsFilters,
  ListingsPagination,
  ListingsSkeleton,
} from "./components";
import { LISTINGS } from "../../lib/graphql/queries";
import {
  Listings as ListingsData,
  ListingsVariables,
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { ListingsFilter } from "../../lib/graphql/globalTypes";
import { useScrollToTop } from "../../lib/hooks";

const { Content } = Layout;
const PAGE_LIMIT = 8;
const { Paragraph, Text, Title } = Typography;

interface MatchParams {
  location: string;
}

export const Listings = () => {
  const { location } = useParams<MatchParams>();
  const locationRef = useRef(location);
  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const [page, setPage] = useState(1);
  const { loading, data, error } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      skip: locationRef.current !== location && page !== 1,
      variables: {
        location: location,
        filter,
        limit: PAGE_LIMIT,
        page,
      },
    }
  );

  useScrollToTop();

  useEffect(() => {
    setPage(1);
  }, [location]);

  const listings = data ? data.listings : null;
  const listingsRegion = listings ? listings.region : null;

  const listingsSectionElement =
    listings && listings.result.length ? (
      <div>
        <Affix offsetTop={64}>
          <ListingsPagination
            total={listings.total}
            page={page}
            limit={PAGE_LIMIT}
            setPage={setPage}
          />
          <ListingsFilters filter={filter} setFilter={setFilter} />
        </Affix>
        <List
          grid={{
            gutter: 8,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
          }}
          dataSource={listings.result}
          renderItem={(listing) => (
            <List.Item>
              <ListingCard listing={listing} />
            </List.Item>
          )}
        />
      </div>
    ) : (
      <div>
        <Paragraph>
          It appears that no listings have yet been created for{" "}
          <Text mark>"{listingsRegion}"</Text>
        </Paragraph>
        <Paragraph>
          Be the first person to create a{" "}
          <Link to="/host">listing in this area</Link>!
        </Paragraph>
      </div>
    );

  const listingsRegionElement = (
    <Title level={3} className="listings__title">
      Results for "{listingsRegion}"
    </Title>
  );

  if (loading) {
    return (
      <Content className="listings">
        <ListingsSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner
          description={`
            We either couldn't find anything matching your search or have encountered an error.
            If you're searching for a unique location, try searching again with more common keywords.
          `}
        />
        <ListingsSkeleton />
      </Content>
    );
  }

  return (
    <Content className="listings">
      {listingsRegionElement}
      {listingsSectionElement}
    </Content>
  );
};
