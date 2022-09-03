import * as React from 'react';
import {
  faCity, faFlag,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Badge, Tooltip,
} from '@mui/material';
import { Stack } from '@mui/system';

interface GameProgressProps {
  isSmall: boolean;
  cities: number;
  countries: number;
}

const miniBadgeSize = '14px';

export default function GameProgress({
  isSmall, cities, countries,
}: GameProgressProps): JSX.Element {
  if (isSmall) {
    return (
      <Stack direction="column" gap={1}>
        <Tooltip title="City guesses">
          <Badge
            badgeContent={cities}
            color="primary"
            sx={{
              span: {
                fontSize: '60%',
                minWidth: miniBadgeSize,
                minHeight: miniBadgeSize,
                height: miniBadgeSize,
                borderRadius: '8px',
                transform: 'scale(1) translate(50%, -40%)',
              },
            }}
          >
            <FontAwesomeIcon icon={faCity} />
          </Badge>
        </Tooltip>
        <Tooltip title="Country guesses">
          <Badge
            badgeContent={countries}
            color="secondary"
            sx={{
              span: {
                fontSize: '60%',
                minWidth: miniBadgeSize,
                minHeight: miniBadgeSize,
                height: miniBadgeSize,
                transform: 'scale(1) translate(50%, -40%)',
                borderRadius: '8px',
              },
            }}
          >
            <FontAwesomeIcon icon={faFlag} />
          </Badge>
        </Tooltip>
      </Stack>
    );
  }
  return (
    <>
      <Tooltip title="City guesses">
        <Badge badgeContent={cities} color="primary">
          <FontAwesomeIcon icon={faCity} size="2x" />
        </Badge>
      </Tooltip>
      <Tooltip title="Country guesses">
        <Badge badgeContent={countries} color="secondary">
          <FontAwesomeIcon icon={faFlag} size="2x" />
        </Badge>
      </Tooltip>
    </>
  );
}
