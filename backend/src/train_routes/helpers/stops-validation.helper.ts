import { BadRequestException } from '@nestjs/common';
import { RouteStop } from 'src/shared/interfaces/route-stop.interface';

export function validateStopsTimes(
  stops: RouteStop[],
  departureTime: Date,
  arrivalTime: Date,
): void {
  if (!stops || stops.length === 0) {
    return;
  }

  if (departureTime >= arrivalTime) {
    throw new BadRequestException('Departure time must be before arrival time');
  }

  const sortedStops = [...stops].sort((a, b) => a.order_index - b.order_index);

  let previousTime = departureTime;

  for (let i = 0; i < sortedStops.length; i++) {
    const stop = sortedStops[i];

    if (stop.time_arrival) {
      const stopTime = new Date(stop.time_arrival);

      if (stopTime <= previousTime) {
        throw new BadRequestException(
          `Stop ${i + 1} time must be after the previous stop time`,
        );
      }

      if (stopTime >= arrivalTime) {
        throw new BadRequestException(
          `Stop ${i + 1} time must be before the arrival time`,
        );
      }

      previousTime = stopTime;
    }
  }
}
